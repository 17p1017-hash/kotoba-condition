const STORAGE_KEY = "kotobaConditionData";

let selectedStutter = null;
let selectedMood = null;


// -------------------------
// データを読み込む
// -------------------------

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return {
      persons: [],
      records: []
    };
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    return {
      persons: [],
      records: []
    };
  }
}


// -------------------------
// データを保存する
// -------------------------

function saveData(data) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );
}


// -------------------------
// 今日の日付
// -------------------------

function setToday() {
  const dateInput =
    document.getElementById("recordDate");

  const today = new Date();

  const year =
    today.getFullYear();

  const month =
    String(today.getMonth() + 1)
      .padStart(2, "0");

  const day =
    String(today.getDate())
      .padStart(2, "0");

  dateInput.value =
    `${year}-${month}-${day}`;
}


// -------------------------
// 10段階ボタンを作る
// -------------------------

function createScoreButtons(
  containerId,
  valueId,
  type
) {

  const container =
    document.getElementById(containerId);

  const valueDisplay =
    document.getElementById(valueId);


  for (let i = 1; i <= 10; i++) {

    const button =
      document.createElement("button");

    button.type = "button";

    button.className =
      "score-button";

    button.textContent = i;


    button.addEventListener(
      "click",
      function () {

        const buttons =
          container.querySelectorAll(
            ".score-button"
          );

        buttons.forEach(
          function (item) {
            item.classList.remove(
              "selected"
            );
          }
        );


        button.classList.add(
          "selected"
        );


        if (type === "stutter") {

          selectedStutter = i;

        } else {

          selectedMood = i;

        }


        valueDisplay.textContent =
          `${i} / 10`;

      }
    );


    container.appendChild(button);

  }

}


// -------------------------
// 利用者一覧を表示
// -------------------------

function refreshPersonSelect(
  selectedPersonId = ""
) {

  const data = loadData();

  const select =
    document.getElementById(
      "personSelect"
    );


  select.innerHTML = "";


  const firstOption =
    document.createElement(
      "option"
    );

  firstOption.value = "";

  firstOption.textContent =
    "利用者を選んでください";

  select.appendChild(
    firstOption
  );


  data.persons.forEach(
    function (person) {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        person.id;

      option.textContent =
        person.name;

      select.appendChild(
        option
      );

    }
  );


  if (selectedPersonId) {
    select.value =
      selectedPersonId;
  }

}


// -------------------------
// 利用者を追加
// -------------------------

function addPerson() {

  const name =
    window.prompt(
      "利用者の名前を入力してください"
    );


  if (!name) {
    return;
  }


  const trimmedName =
    name.trim();


  if (!trimmedName) {
    return;
  }


  const data =
    loadData();


  const person = {
    id:
      "person_" +
      Date.now() +
      "_" +
      Math.random()
        .toString(36)
        .slice(2, 8),

    name:
      trimmedName
  };


  data.persons.push(
    person
  );


  saveData(data);


  refreshPersonSelect(
    person.id
  );


  showMessage(
    `${trimmedName}さんを追加しました`
  );

}


// -------------------------
// 記録を保存
// -------------------------

function saveRecord() {

  const personId =
    document.getElementById(
      "personSelect"
    ).value;


  const date =
    document.getElementById(
      "recordDate"
    ).value;


  const memo =
    document.getElementById(
      "memo"
    ).value.trim();


  if (!personId) {

    showMessage(
      "利用者を選んでください",
      true
    );

    return;

  }


  if (!date) {

    showMessage(
      "日付を選んでください",
      true
    );

    return;

  }


  if (selectedStutter === null) {

    showMessage(
      "吃音の調子を選んでください",
      true
    );

    return;

  }


  if (selectedMood === null) {

    showMessage(
      "心の調子を選んでください",
      true
    );

    return;

  }


  const data =
    loadData();


  /*
    同じ利用者・同じ日付の
    記録があるか確認
  */

  const existingIndex =
    data.records.findIndex(
      function (record) {

        return (
          record.personId === personId &&
          record.date === date
        );

      }
    );


  const record = {

    personId:
      personId,

    date:
      date,

    stutter:
      selectedStutter,

    mood:
      selectedMood,

    memo:
      memo,

    updatedAt:
      new Date().toISOString()

  };


  if (existingIndex >= 0) {

    data.records[
      existingIndex
    ] = record;


    saveData(data);


    showMessage(
      "この日の記録を更新しました"
    );

  } else {

    data.records.push(
      record
    );


    saveData(data);


    showMessage(
      "記録を保存しました"
    );

  }

}


// -------------------------
// メッセージ表示
// -------------------------

function showMessage(
  text,
  isError = false
) {

  const message =
    document.getElementById(
      "message"
    );


  message.textContent =
    text;


  if (isError) {

    message.style.color =
      "#b33";

  } else {

    message.style.color =
      "#376d3f";

  }

}


// -------------------------
// 入力をリセット
// -------------------------

function resetScores() {

  selectedStutter =
    null;

  selectedMood =
    null;


  document.getElementById(
    "stutterValue"
  ).textContent =
    "未選択";


  document.getElementById(
    "moodValue"
  ).textContent =
    "未選択";


  document.querySelectorAll(
    ".score-button"
  ).forEach(
    function (button) {

      button.classList.remove(
        "selected"
      );

    }
  );


  document.getElementById(
    "memo"
  ).value = "";

}


// -------------------------
// その日の記録を読み込む
// -------------------------

function loadExistingRecord() {

  resetScores();


  const personId =
    document.getElementById(
      "personSelect"
    ).value;


  const date =
    document.getElementById(
      "recordDate"
    ).value;


  if (!personId || !date) {
    return;
  }


  const data =
    loadData();


  const record =
    data.records.find(
      function (item) {

        return (
          item.personId === personId &&
          item.date === date
        );

      }
    );


  if (!record) {
    return;
  }


  selectedStutter =
    record.stutter;

  selectedMood =
    record.mood;


  selectScoreButton(
    "stutterButtons",
    record.stutter
  );


  selectScoreButton(
    "moodButtons",
    record.mood
  );


  document.getElementById(
    "stutterValue"
  ).textContent =
    `${record.stutter} / 10`;


  document.getElementById(
    "moodValue"
  ).textContent =
    `${record.mood} / 10`;


  document.getElementById(
    "memo"
  ).value =
    record.memo || "";


  showMessage(
    "この日の記録があります"
  );

}


// -------------------------
// 保存済み数字を選択状態にする
// -------------------------

function selectScoreButton(
  containerId,
  score
) {

  const buttons =
    document
      .getElementById(
        containerId
      )
      .querySelectorAll(
        ".score-button"
      );


  buttons.forEach(
    function (button) {

      if (
        Number(
          button.textContent
        ) === score
      ) {

        button.classList.add(
          "selected"
        );

      }

    }
  );

}


// -------------------------
// 初期設定
// -------------------------

createScoreButtons(
  "stutterButtons",
  "stutterValue",
  "stutter"
);


createScoreButtons(
  "moodButtons",
  "moodValue",
  "mood"
);


setToday();

refreshPersonSelect();


// -------------------------
// ボタン
// -------------------------

document
  .getElementById(
    "addPersonButton"
  )
  .addEventListener(
    "click",
    addPerson
  );


document
  .getElementById(
    "saveButton"
  )
  .addEventListener(
    "click",
    saveRecord
  );


// -------------------------
// 利用者・日付変更
// -------------------------

document
  .getElementById(
    "personSelect"
  )
  .addEventListener(
    "change",
    function () {

      showMessage("");

      loadExistingRecord();

    }
  );


document
  .getElementById(
    "recordDate"
  )
  .addEventListener(
    "change",
    function () {

      showMessage("");

      loadExistingRecord();

    }
  );
