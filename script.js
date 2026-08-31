const STORAGE_KEY =
  "kotobaConditionData";

let selectedStutter = null;
let selectedMood = null;
let conditionChart = null;


// =========================
// データ
// =========================

function loadData() {

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


  try {

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

  } catch (error) {

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

  const today =
    new Date();


  const year =
    today.getFullYear();


  const month =
    String(
      today.getMonth() + 1
    ).padStart(2, "0");


  const day =
    String(
      today.getDate()
    ).padStart(2, "0");


  return `${year}-${month}-${day}`;

}


function getCurrentMonthString() {

  return getTodayString()
    .slice(0,7);

}


function setInitialDates() {

  document.getElementById(
    "recordDate"
  ).value =
    getTodayString();


  document.getElementById(
    "monthSelect"
  ).value =
    getCurrentMonthString();

}


// =========================
// タブ
// =========================

function showRecordPage() {

  document.getElementById(
    "recordPage"
  ).classList.add(
    "active"
  );


  document.getElementById(
    "reviewPage"
  ).classList.remove(
    "active"
  );


  document.getElementById(
    "recordTabButton"
  ).classList.add(
    "active"
  );


  document.getElementById(
    "reviewTabButton"
  ).classList.remove(
    "active"
  );

}


function showReviewPage() {

  document.getElementById(
    "recordPage"
  ).classList.remove(
    "active"
  );


  document.getElementById(
    "reviewPage"
  ).classList.add(
    "active"
  );


  document.getElementById(
    "recordTabButton"
  ).classList.remove(
    "active"
  );


  document.getElementById(
    "reviewTabButton"
  ).classList.add(
    "active"
  );


  updateReview();

}


// =========================
// 10段階
// =========================

function createScoreButtons(
  containerId,
  valueId,
  type
) {

  const container =
    document.getElementById(
      containerId
    );


  const valueDisplay =
    document.getElementById(
      valueId
    );


  container.innerHTML = "";


  for (
    let i = 1;
    i <= 10;
    i++
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
      i;


    button.addEventListener(
      "click",
      function () {


        container
          .querySelectorAll(
            ".score-button"
          )
          .forEach(
            function (item) {

              item.classList.remove(
                "selected"
              );

            }
          );


        button.classList.add(
          "selected"
        );


        if (
          type === "stutter"
        ) {

          selectedStutter =
            i;

        } else {

          selectedMood =
            i;

        }


        valueDisplay.textContent =
          `${i} / 10`;

      }
    );


    container.appendChild(
      button
    );

  }

}


// =========================
// 利用者
// =========================

function refreshPersonSelect(
  selectedPersonId = ""
) {

  const data =
    loadData();


  const select =
    document.getElementById(
      "personSelect"
    );


  select.innerHTML =
    "";


  const firstOption =
    document.createElement(
      "option"
    );


  firstOption.value =
    "";


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


  if (
    selectedPersonId
  ) {

    select.value =
      selectedPersonId;

  }

}


// =========================
// 利用者追加
// =========================

function addPerson() {

  const name =
    window.prompt(
      "利用者の名前を入力してください"
    );


  if (
    name === null
  ) {

    return;

  }


  const trimmedName =
    name.trim();


  if (
    !trimmedName
  ) {

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
      trimmedName

  };


  data.persons.push(
    person
  );


  saveData(
    data
  );


  refreshPersonSelect(
    person.id
  );


  resetForm();

  updateReview();


  showMessage(
    `${trimmedName}さんを追加しました`
  );

}


// =========================
// 利用者削除
// =========================

function deletePerson() {

  const personId =
    document.getElementById(
      "personSelect"
    ).value;


  if (
    !personId
  ) {

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
      function (item) {

        return (
          item.id ===
          personId
        );

      }
    );


  if (
    !person
  ) {

    return;

  }


  const confirmed =
    window.confirm(
      `${person.name}さんを削除しますか？\n\nこの利用者の記録もすべて削除されます。`
    );


  if (
    !confirmed
  ) {

    return;

  }


  data.persons =
    data.persons.filter(
      function (item) {

        return (
          item.id !==
          personId
        );

      }
    );


  data.records =
    data.records.filter(
      function (record) {

        return (
          record.personId !==
          personId
        );

      }
    );


  saveData(
    data
  );


  refreshPersonSelect();

  resetForm();

  updateReview();


  showMessage(
    `${person.name}さんを削除しました`
  );

}


// =========================
// 保存
// =========================

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


  if (
    !personId
  ) {

    showMessage(
      "利用者を選んでください",
      true
    );

    return;

  }


  if (
    !date
  ) {

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


  const existingIndex =
    data.records.findIndex(
      function (record) {

        return (
          record.personId ===
            personId &&
          record.date ===
            date
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
      new Date()
        .toISOString()

  };


  if (
    existingIndex >= 0
  ) {

    data.records[
      existingIndex
    ] = record;


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


  saveData(
    data
  );


  document.getElementById(
    "monthSelect"
  ).value =
    date.slice(0,7);


  updateReview();

}


// =========================
// メッセージ
// =========================

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


  message.style.color =
    isError
      ? "#b45f59"
      : "#607b73";

}


// =========================
// 入力リセット
// =========================

function resetForm() {

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


  document
    .querySelectorAll(
      ".score-button"
    )
    .forEach(
      function (button) {

        button.classList.remove(
          "selected"
        );

      }
    );


  document.getElementById(
    "memo"
  ).value =
    "";

}


// =========================
// 点数表示
// =========================

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
// 保存済み記録読み込み
// =========================

function loadExistingRecord() {

  resetForm();


  const personId =
    document.getElementById(
      "personSelect"
    ).value;


  const date =
    document.getElementById(
      "recordDate"
    ).value;


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
      function (item) {

        return (
          item.personId ===
            personId &&
          item.date ===
            date
        );

      }
    );


  if (
    !record
  ) {

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


  selectScoreButton(
    "stutterButtons",
    selectedStutter
  );


  selectScoreButton(
    "moodButtons",
    selectedMood
  );


  document.getElementById(
    "stutterValue"
  ).textContent =
    `${selectedStutter} / 10`;


  document.getElementById(
    "moodValue"
  ).textContent =
    `${selectedMood} / 10`;


  document.getElementById(
    "memo"
  ).value =
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
    document.getElementById(
      "personSelect"
    ).value;


  const month =
    document.getElementById(
      "monthSelect"
    ).value;


  if (
    !personId ||
    !month
  ) {

    return [];

  }


  const data =
    loadData();


  return data.records
    .filter(
      function (record) {

        return (
          record.personId ===
            personId &&
          record.date.startsWith(
            month
          )
        );

      }
    )
    .sort(
      function (a,b) {

        return (
          a.date.localeCompare(
            b.date
          )
        );

      }
    );

}


// =========================
// 平均
// =========================

function calculateAverage(
  records,
  key
) {

  if (
    records.length === 0
  ) {

    return null;

  }


  const total =
    records.reduce(
      function (sum,record) {

        return (
          sum +
          Number(
            record[key]
          )
        );

      },
      0
    );


  return (
    total /
    records.length
  ).toFixed(1);

}


// =========================
// 月平均
// =========================

function updateSummary(
  records
) {

  const stutterAverage =
    calculateAverage(
      records,
      "stutter"
    );


  const moodAverage =
    calculateAverage(
      records,
      "mood"
    );


  document.getElementById(
    "stutterAverage"
  ).textContent =
    stutterAverage === null
      ? "-"
      : stutterAverage;


  document.getElementById(
    "moodAverage"
  ).textContent =
    moodAverage === null
      ? "-"
      : moodAverage;


  document.getElementById(
    "recordCount"
  ).textContent =
    `${records.length}日`;

}


// =========================
// グラフ
// =========================

function updateChart(
  records
) {

  const canvas =
    document.getElementById(
      "conditionChart"
    );


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


  const labels =
    records.map(
      function (record) {

        return (
          Number(
            record.date.slice(
              8,
              10
            )
          ) +
          "日"
        );

      }
    );


  const stutterData =
    records.map(
      function (record) {

        return Number(
          record.stutter
        );

      }
    );


  const moodData =
    records.map(
      function (record) {

        return Number(
          record.mood
        );

      }
    );


  conditionChart =
    new Chart(
      canvas,
      {

        type:
          "line",

        data: {

          labels:
            labels,

          datasets: [

            {

              label:
                "吃音の調子",

              data:
                stutterData,

              borderColor:
                "#799b91",

              backgroundColor:
                "#799b91",

              tension:
                0.25,

              pointRadius:
                5,

              pointHoverRadius:
                6

            },

            {

              label:
                "心の調子",

              data:
                moodData,

              borderColor:
                "#b9957b",

              backgroundColor:
                "#b9957b",

              tension:
                0.25,

              pointRadius:
                5,

              pointHoverRadius:
                6

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

              }

            }

          },

          plugins: {

            legend: {

              labels: {

                usePointStyle:
                  true

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

  const historyList =
    document.getElementById(
      "historyList"
    );


  historyList.innerHTML =
    "";


  if (
    records.length === 0
  ) {

    historyList.innerHTML =
      '<div class="empty-message">この月の記録はまだありません</div>';

    return;

  }


  const reversed =
    [...records].reverse();


  reversed.forEach(
    function (record) {


      const item =
        document.createElement(
          "div"
        );


      item.className =
        "history-item";


      const parts =
        record.date.split(
          "-"
        );


      const month =
        Number(
          parts[1]
        );


      const day =
        Number(
          parts[2]
        );


      const top =
        document.createElement(
          "div"
        );


      top.className =
        "history-top";


      const dateElement =
        document.createElement(
          "div"
        );


      dateElement.className =
        "history-date";


      dateElement.textContent =
        `${month}月${day}日`;


      top.appendChild(
        dateElement
      );


      const scores =
        document.createElement(
          "div"
        );


      scores.className =
        "history-scores";


      const stutterTag =
        document.createElement(
          "div"
        );


      stutterTag.className =
        "score-tag";


      stutterTag.textContent =
        `吃音 ${record.stutter} / 10`;


      const moodTag =
        document.createElement(
          "div"
        );


      moodTag.className =
        "score-tag";


      moodTag.textContent =
        `心 ${record.mood} / 10`;


      scores.appendChild(
        stutterTag
      );


      scores.appendChild(
        moodTag
      );


      item.appendChild(
        top
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
        function () {


          document.getElementById(
            "recordDate"
          ).value =
            record.date;


          loadExistingRecord();


          showRecordPage();


          window.scrollTo({

            top:
              0,

            behavior:
              "smooth"

          });

        }
      );


      historyList.appendChild(
        item
      );

    }
  );

}


// =========================
// 振り返り更新
// =========================

function updateReview() {

  const personId =
    document.getElementById(
      "personSelect"
    ).value;


  if (
    !personId
  ) {

    updateSummary([]);

    updateHistory([]);

    updateChart([]);

    return;

  }


  const records =
    getMonthlyRecords();


  updateSummary(
    records
  );


  updateHistory(
    records
  );


  updateChart(
    records
  );

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


setInitialDates();

refreshPersonSelect();

updateReview();

showRecordPage();


// =========================
// イベント
// =========================

document
  .getElementById(
    "recordTabButton"
  )
  .addEventListener(
    "click",
    showRecordPage
  );


document
  .getElementById(
    "reviewTabButton"
  )
  .addEventListener(
    "click",
    showReviewPage
  );


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
    "deletePersonButton"
  )
  .addEventListener(
    "click",
    deletePerson
  );


document
  .getElementById(
    "saveButton"
  )
  .addEventListener(
    "click",
    saveRecord
  );


document
  .getElementById(
    "personSelect"
  )
  .addEventListener(
    "change",
    function () {

      loadExistingRecord();

      updateReview();

    }
  );


document
  .getElementById(
    "recordDate"
  )
  .addEventListener(
    "change",
    loadExistingRecord
  );


document
  .getElementById(
    "monthSelect"
  )
  .addEventListener(
    "change",
    updateReview
  );
