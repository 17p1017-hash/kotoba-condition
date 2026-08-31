const STORAGE_KEY =
  "kotobaConditionData";

let selectedStutter = null;
let selectedMood = null;
let conditionChart = null;

const $ = id =>
  document.getElementById(id);


// =========================
// データ
// =========================

function loadData() {

  try {

    const saved =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!saved) {

      return {
        persons: [],
        records: []
      };

    }

    const data =
      JSON.parse(saved);

    return {

      persons:
        Array.isArray(data.persons)
          ? data.persons
          : [],

      records:
        Array.isArray(data.records)
          ? data.records
          : []

    };

  } catch {

    return {
      persons: [],
      records: []
    };

  }

}


function saveData(data) {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );

}


// =========================
// 日付
// =========================

function getTodayString() {

  const date =
    new Date();

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;

}


// =========================
// タブ
// =========================

function showPage(page) {

  const recordMode =
    page === "record";

  $("recordPage")
    .classList.toggle(
      "active",
      recordMode
    );

  $("reviewPage")
    .classList.toggle(
      "active",
      !recordMode
    );

  $("recordTabButton")
    .classList.toggle(
      "active",
      recordMode
    );

  $("reviewTabButton")
    .classList.toggle(
      "active",
      !recordMode
    );

  if (!recordMode) {
    updateReview();
  }

}


// =========================
// 点数
// =========================

function createScoreButtons(
  containerId,
  valueId,
  type
) {

  const container =
    $(containerId);

  container.innerHTML =
    "";


  for (
    let score = 1;
    score <= 10;
    score++
  ) {

    const button =
      document.createElement(
        "button"
      );

    button.type =
      "button";

    button.className =
      "score-button";

    button.textContent =
      score;


    button.addEventListener(
      "click",
      () => {

        container
          .querySelectorAll(
            ".score-button"
          )
          .forEach(
            item =>
              item.classList.remove(
                "selected"
              )
          );


        button.classList.add(
          "selected"
        );


        if (
          type === "stutter"
        ) {

          selectedStutter =
            score;

        } else {

          selectedMood =
            score;

        }


        $(valueId).textContent =
          `${score} / 10　数字が高いほど調子がいい`;

      }
    );


    container.appendChild(
      button
    );

  }

}


function resetScores() {

  selectedStutter =
    null;

  selectedMood =
    null;


  $("stutterValue")
    .textContent =
      "未選択";

  $("moodValue")
    .textContent =
      "未選択";


  document
    .querySelectorAll(
      ".score-button"
    )
    .forEach(
      button =>
        button.classList.remove(
          "selected"
        )
    );

}


function showSavedScore(
  containerId,
  score
) {

  $(containerId)
    .querySelectorAll(
      ".score-button"
    )
    .forEach(
      button => {

        if (
          Number(
            button.textContent
          ) ===
          Number(score)
        ) {

          button.classList.add(
            "selected"
          );

        }

      }
    );

}


// =========================
// 利用者
// =========================

function refreshPersons(
  selectedId = ""
) {

  const data =
    loadData();

  const select =
    $("personSelect");

  select.innerHTML =
    "";


  const empty =
    document.createElement(
      "option"
    );

  empty.value =
    "";

  empty.textContent =
    "利用者を選んでください";

  select.appendChild(
    empty
  );


  data.persons.forEach(
    person => {

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


  if (selectedId) {

    select.value =
      selectedId;

  }

}


function addPerson() {

  const input =
    prompt(
      "利用者の名前を入力してください"
    );

  if (
    input === null
  ) {

    return;

  }


  const name =
    input.trim();


  if (!name) {

    showMessage(
      "名前を入力してください",
      true
    );

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
        .slice(2,8),

    name:
      name

  };


  data.persons.push(
    person
  );

  saveData(data);

  refreshPersons(
    person.id
  );

  loadExistingRecord();

  updateReview();


  showMessage(
    `${name}さんを追加しました`
  );

}


function deletePerson() {

  const personId =
    $("personSelect").value;


  if (!personId) {

    showMessage(
      "削除する利用者を選んでください",
      true
    );

    return;

  }


  const data =
    loadData();


  const person =
    data.persons.find(
      person =>
        person.id === personId
    );


  if (!person) {
    return;
  }


  const ok =
    confirm(
      `${person.name}さんを削除しますか？\n\nこの利用者の記録もすべて削除されます。`
    );


  if (!ok) {
    return;
  }


  data.persons =
    data.persons.filter(
      person =>
        person.id !== personId
    );


  data.records =
    data.records.filter(
      record =>
        record.personId !==
        personId
    );


  saveData(data);

  refreshPersons();

  resetForm();

  updateReview();


  showMessage(
    `${person.name}さんを削除しました`
  );

}


// =========================
// 記録
// =========================

function saveRecord() {

  const personId =
    $("personSelect").value;

  const date =
    $("recordDate").value;

  const memo =
    $("memo").value.trim();


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


  if (
    selectedStutter === null
  ) {

    showMessage(
      "吃音の調子を選んでください",
      true
    );

    return;

  }


  if (
    selectedMood === null
  ) {

    showMessage(
      "心の調子を選んでください",
      true
    );

    return;

  }


  const data =
    loadData();


  const index =
    data.records.findIndex(
      record =>
        record.personId ===
          personId &&
        record.date ===
          date
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
      new Date()
        .toISOString()

  };


  if (
    index >= 0
  ) {

    data.records[index] =
      record;

    showMessage(
      "この日の記録を更新しました"
    );

  } else {

    data.records.push(
      record
    );

    showMessage(
      "記録を保存しました"
    );

  }


  saveData(data);


  $("monthSelect").value =
    date.slice(0,7);


  updateReview();

}


function resetForm() {

  resetScores();

  $("memo").value =
    "";

}


function showMessage(
  text,
  error = false
) {

  $("message").textContent =
    text;

  $("message").style.color =
    error
      ? "#b45f59"
      : "#607b73";

}


// =========================
// 保存済み記録
// =========================

function loadExistingRecord() {

  resetForm();


  const personId =
    $("personSelect").value;

  const date =
    $("recordDate").value;


  if (
    !personId ||
    !date
  ) {

    showMessage("");

    return;

  }


  const data =
    loadData();


  const record =
    data.records.find(
      item =>
        item.personId ===
          personId &&
        item.date ===
          date
    );


  if (!record) {

    showMessage(
      "この日の記録はまだありません"
    );

    return;

  }


  selectedStutter =
    Number(
      record.stutter
    );

  selectedMood =
    Number(
      record.mood
    );


  showSavedScore(
    "stutterButtons",
    selectedStutter
  );

  showSavedScore(
    "moodButtons",
    selectedMood
  );


  $("stutterValue")
    .textContent =
      `${selectedStutter} / 10　数字が高いほど調子がいい`;

  $("moodValue")
    .textContent =
      `${selectedMood} / 10　数字が高いほど調子がいい`;


  $("memo").value =
    record.memo || "";


  showMessage(
    "この日の記録があります"
  );

}


// =========================
// 月データ
// =========================

function getMonthlyRecords() {

  const personId =
    $("personSelect").value;

  const month =
    $("monthSelect").value;


  if (
    !personId ||
    !month
  ) {

    return [];

  }


  return loadData()
    .records
    .filter(
      record =>
        record.personId ===
          personId &&
        record.date.startsWith(
          month
        )
    )
    .sort(
      (a,b) =>
        a.date.localeCompare(
          b.date
        )
    );

}


function average(
  records,
  key
) {

  if (
    !records.length
  ) {

    return null;

  }


  const total =
    records.reduce(
      (sum,record) =>
        sum +
        Number(record[key]),
      0
    );


  return (
    total /
    records.length
  ).toFixed(1);

}


function updateSummary(
  records
) {

  const stutter =
    average(
      records,
      "stutter"
    );

  const mood =
    average(
      records,
      "mood"
    );


  $("stutterAverage")
    .textContent =
      stutter ?? "-";

  $("moodAverage")
    .textContent =
      mood ?? "-";

  $("recordCount")
    .textContent =
      `${records.length}日`;

}


// =========================
// グラフ
// =========================

function updateChart(
  records
) {

  if (
    conditionChart
  ) {

    conditionChart.destroy();

    conditionChart =
      null;

  }


  if (
    typeof Chart ===
    "undefined"
  ) {

    return;

  }


  conditionChart =
    new Chart(
      $("conditionChart"),
      {

        type:
          "line",

        data: {

          labels:
            records.map(
              record =>
                `${Number(
                  record.date.slice(
                    8,
                    10
                  )
                )}日`
            ),

          datasets: [

            {

              label:
                "吃音の調子",

              data:
                records.map(
                  record =>
                    Number(
                      record.stutter
                    )
                ),

              borderColor:
                "#799b91",

              backgroundColor:
                "#799b91",

              tension:
                0.25,

              pointRadius:
                5

            },

            {

              label:
                "心の調子",

              data:
                records.map(
                  record =>
                    Number(
                      record.mood
                    )
                ),

              borderColor:
                "#b9957b",

              backgroundColor:
                "#b9957b",

              tension:
                0.25,

              pointRadius:
                5

            }

          ]

        },

        options: {

          responsive:
            true,

          maintainAspectRatio:
            false,

          scales: {

            y: {

              min:
                1,

              max:
                10,

              ticks: {
                stepSize:
                  1
              },

              title: {
                display:
                  true,

                text:
                  "高いほど調子がいい"
              }

            }

          }

        }

      }
    );

}


// =========================
// 過去記録
// =========================

function updateHistory(
  records
) {

  const list =
    $("historyList");

  list.innerHTML =
    "";


  if (
    !records.length
  ) {

    const empty =
      document.createElement(
        "div"
      );

    empty.className =
      "empty-message";

    empty.textContent =
      "この月の記録はまだありません";

    list.appendChild(
      empty
    );

    return;

  }


  [...records]
    .reverse()
    .forEach(
      record => {

        const item =
          document.createElement(
            "div"
          );

        item.className =
          "history-item";


        const date =
          document.createElement(
            "div"
          );

        date.className =
          "history-date";


        const parts =
          record.date.split(
            "-"
          );


        date.textContent =
          `${Number(parts[1])}月${Number(parts[2])}日`;


        const scores =
          document.createElement(
            "div"
          );

        scores.className =
          "history-scores";


        const stutter =
          document.createElement(
            "div"
          );

        stutter.className =
          "score-tag";

        stutter.textContent =
          `吃音 ${record.stutter} / 10`;


        const mood =
          document.createElement(
            "div"
          );

        mood.className =
          "score-tag";

        mood.textContent =
          `心 ${record.mood} / 10`;


        scores.appendChild(
          stutter
        );

        scores.appendChild(
          mood
        );


        item.appendChild(
          date
        );

        item.appendChild(
          scores
        );


        if (
          record.memo
        ) {

          const memo =
            document.createElement(
              "div"
            );

          memo.className =
            "history-memo";

          memo.textContent =
            record.memo;

          item.appendChild(
            memo
          );

        }


        item.addEventListener(
          "click",
          () => {

            $("recordDate").value =
              record.date;

            loadExistingRecord();

            showPage(
              "record"
            );

            window.scrollTo({
              top: 0,
              behavior: "smooth"
            });

          }
        );


        list.appendChild(
          item
        );

      }
    );

}


function updateReview() {

  const records =
    getMonthlyRecords();

  updateSummary(
    records
  );

  updateChart(
    records
  );

  updateHistory(
    records
  );

}


// =========================
// バックアップ
// =========================

function createBackup() {

  const data =
    loadData();


  if (
    data.persons.length === 0 &&
    data.records.length === 0
  ) {

    showDataMessage(
      "バックアップするデータがありません",
      true
    );

    return;

  }


  const backup = {

    app:
      "kotoba-condition",

    version:
      1,

    createdAt:
      new Date()
        .toISOString(),

    data:
      data

  };


  const json =
    JSON.stringify(
      backup,
      null,
      2
    );


  const blob =
    new Blob(
      [json],
      {
        type:
          "application/json"
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const link =
    document.createElement(
      "a"
    );


  link.href =
    url;


  link.download =
    `kotoba-condition-backup-${getTodayString()}.json`;


  document.body
    .appendChild(
      link
    );


  link.click();

  link.remove();


  setTimeout(
    () =>
      URL.revokeObjectURL(
        url
      ),
    1000
  );


  showDataMessage(
    "バックアップを保存しました"
  );

}


function openRestoreFile() {

  $("restoreFileInput").value =
    "";

  $("restoreFileInput").click();

}


function restoreBackup(
  event
) {

  const file =
    event.target.files[0];


  if (!file) {
    return;
  }


  const reader =
    new FileReader();


  reader.onload =
    function () {

      try {

        const backup =
          JSON.parse(
            reader.result
          );


        if (
          backup.app !==
            "kotoba-condition" ||
          !backup.data ||
          !Array.isArray(
            backup.data.persons
          ) ||
          !Array.isArray(
            backup.data.records
          )
        ) {

          throw new Error();

        }


        const ok =
          confirm(
            "現在の利用者と記録をバックアップの内容に置き換えます。\n\n復元しますか？"
          );


        if (!ok) {
          return;
        }


        saveData({
          persons:
            backup.data.persons,

          records:
            backup.data.records
        });


        refreshPersons();

        resetForm();

        updateReview();


        showDataMessage(
          "バックアップを復元しました"
        );


      } catch {

        showDataMessage(
          "このファイルは復元できません",
          true
        );

      }

    };


  reader.readAsText(
    file
  );

}


function showDataMessage(
  text,
  error = false
) {

  $("dataMessage")
    .textContent =
      text;


  $("dataMessage")
    .style.color =
      error
        ? "#b45f59"
        : "#607b73";

}


// =========================
// 初期設定
// =========================

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


$("recordDate").value =
  getTodayString();


$("monthSelect").value =
  getTodayString()
    .slice(0,7);


refreshPersons();

updateReview();

showPage(
  "record"
);


// =========================
// イベント
// =========================

$("recordTabButton")
  .addEventListener(
    "click",
    () =>
      showPage(
        "record"
      )
  );


$("reviewTabButton")
  .addEventListener(
    "click",
    () =>
      showPage(
        "review"
      )
  );


$("addPersonButton")
  .addEventListener(
    "click",
    addPerson
  );


$("deletePersonButton")
  .addEventListener(
    "click",
    deletePerson
  );


$("saveButton")
  .addEventListener(
    "click",
    saveRecord
  );


$("personSelect")
  .addEventListener(
    "change",
    () => {

      loadExistingRecord();

      updateReview();

    }
  );


$("recordDate")
  .addEventListener(
    "change",
    loadExistingRecord
  );


$("monthSelect")
  .addEventListener(
    "change",
    updateReview
  );


$("backupButton")
  .addEventListener(
    "click",
    createBackup
  );


$("restoreButton")
  .addEventListener(
    "click",
    openRestoreFile
  );


$("restoreFileInput")
  .addEventListener(
    "change",
    restoreBackup
  );
