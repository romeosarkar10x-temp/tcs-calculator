class DynamicTable {
  constructor(DOM_container, initializer, id) {
    this.DOM_tableContainer = DOM_container;
    this.initializer = initializer;

    const key = "table";

    if (id != null) {
      this.key = key + "#" + id;
    } else {
      this.key = key;
    }
  }

  _DOM_createCell(value) {
    const DOM_td = document.createElement("td");
    const DOM_input = document.createElement("input");

    DOM_td.appendChild(DOM_input);

    if (value == null) {
      return DOM_td;
    }

    DOM_input.value = value;
    return DOM_td;
  }

  _DOM_createHeadCell(value) {
    const DOM_th = document.createElement("th");

    if (value == null) {
      return DOM_th;
    }

    const DOM_input = document.createElement("input");
    DOM_input.value = value;

    DOM_th.appendChild(DOM_input);
    return DOM_th;
  }

  _isEmptyLastRow() {
    let isEmpty = true;

    console.log("number of rows:", this.numberOfRows);
    if (this.numberOfRows == 0) {
      return false;
    }

    this.DOM_tableBody.childNodes
      .item(this.numberOfRows - 1)
      .childNodes.forEach((DOM_td) => {
        isEmpty = isEmpty && DOM_td.firstChild.value == "";
      });

    return isEmpty;
  }

  _callback_incipientRowCell = ((event) => {
    const DOM_input = event.target;
    console.log("callback_incipientRowCell", DOM_input);
    this._convertIncipientRowToLastRow(DOM_input.parentNode.parentNode);
    this._pushRow();
  }).bind(this);

  _callback_lastRowCell = (() => {
    console.log("_callback_lastRowCell");
    this._popEmptyRows();
  }).bind(this);

  _callback_compute = ((event) => {
    console.log("_callback_compute");
    this._computeRow(event.target.parentNode.parentNode);
  }).bind(this);

  _DOM_createIncipientRow() {
    const DOM_tr = document.createElement("tr");

    for (let i = 0; i < this.numberOfColumns; i++) {
      DOM_tr.appendChild(this._DOM_createCell());
      DOM_tr.lastChild.firstChild.addEventListener(
        "input",
        this._callback_incipientRowCell
      );
    }

    DOM_tr.classList.add("incipient");
    return DOM_tr;
  }

  _DOM_createRow() {
    const DOM_tr = this._DOM_createIncipientRow();
    this._convertIncipientRowToLastRow(DOM_tr);
    this._convertLastRowToRow(DOM_tr);

    return DOM_tr;
  }

  _convertIncipientRowToLastRow(DOM_tr) {
    if (DOM_tr == null) {
      return;
    }

    DOM_tr.classList.remove("incipient");

    DOM_tr.childNodes.forEach((DOM_td) => {
      DOM_td.firstChild.removeEventListener(
        "input",
        this._callback_incipientRowCell
      );
      DOM_td.firstChild.addEventListener("input", this._callback_lastRowCell);
      DOM_td.firstChild.addEventListener("input", this._callback_compute);
    });
  }

  _convertLastRowToRow(DOM_tr) {
    if (DOM_tr == null) {
      return;
    }

    DOM_tr.childNodes.forEach((DOM_td) => {
      DOM_td.firstChild.removeEventListener(
        "input",
        this._callback_lastRowCell
      );
    });
  }

  _convertRowToLastRow(DOM_tr) {
    if (DOM_tr == null) {
      return;
    }

    DOM_tr.childNodes.forEach((DOM_td) => {
      DOM_td.addEventListener("input", this._callback_lastRowCell);
    });
  }

  _convertLastRowToIncipientRow(DOM_tr) {
    DOM_tr.classList.add("incipient");

    DOM_tr.childNodes.forEach((DOM_td) => {
      DOM_td.firstChild.removeEventListener(
        "input",
        this._callback_lastRowCell
      );
      DOM_td.firstChild.removeEventListener("input", this._callback_compute);
      DOM_td.firstChild.addEventListener(
        "input",
        this._callback_incipientRowCell
      );
    });
  }

  _pushRow() {
    console.log("appendRow, before, number of rows:", this.numberOfRows);
    const DOM_tr = this._DOM_createIncipientRow();

    this._convertIncipientRowToLastRow(
      this.DOM_tableBody.childNodes.item(this.numberOfRows)
    );

    this._convertLastRowToRow(
      this.DOM_tableBody.childNodes.item(this.numberOfRows - 1)
    );

    this.numberOfRows++;
    this.DOM_tableBody.appendChild(DOM_tr);
    console.log("appendRow, after, number of rows:", this.numberOfRows);
  }

  _popEmptyRows() {
    while (this._isEmptyLastRow()) {
      this._popRow();
    }
  }

  _popRow() {
    this.numberOfRows--;
    console.log("popped row! number of rows:", this.numberOfRows);
    this.DOM_tableBody.removeChild(this.DOM_tableBody.lastChild);

    this._convertLastRowToIncipientRow(
      this.DOM_tableBody.childNodes.item(this.numberOfRows)
    );

    this._convertRowToLastRow(
      this.DOM_tableBody.childNodes.item(this.numberOfRows - 1)
    );
  }

  _getData() {
    const data = { table: [] };
    const DOM_inputs = document.querySelectorAll("input.input");

    DOM_inputs.forEach((DOM_input) => {
      const id = DOM_input.id;
      data[id] = DOM_input.value;
    });

    for (let i = 0; i < this.numberOfRows; i++) {
      const row = [];

      for (let j = 0; j < this.numberOfColumns; j++) {
        row.push(
          this.DOM_tableBody.childNodes.item(i).childNodes.item(j).firstChild
            .value
        );
      }

      data.table.push(row);
    }

    return data;
  }

  _computeRow(DOM_tr) {
    let indexRow = 0;
    let indexColumn = 0;

    {
      // Find indexRow
      let i = 0;

      this.DOM_tableBody.childNodes.forEach((e) => {
        if (e == DOM_tr) {
          indexRow = i;
        }

        i++;
      });

      console.log("indexRow", indexRow);
    }

    function filter(value) {
      if (value == null) {
        return "?";
      }

      if (isNaN(value)) {
        return "?";
      }

      return value;
    }

    DOM_tr.childNodes.forEach((DOM_td) => {
      const DOM_input = DOM_td.firstChild;
      const f = this.initializer[indexColumn].f;

      if (typeof f === "function") {
        DOM_input.value = filter(
          this.initializer[indexColumn].f(
            this._getData(),
            indexRow,
            indexColumn
          )
        );
      }

      indexColumn++;
    });
  }

  computeTable = (() => {
    for (let i = 0; i < this.numberOfRows; i++) {
      this._computeRow(this.DOM_tableBody.childNodes.item(i));
    }
  }).bind(this);

  _initializeTable() {
    this.numberOfRows = 0;
    this.numberOfColumns = 0;

    const DOM_table = document.createElement("table");
    const DOM_tableHead = document.createElement("thead");
    const DOM_tableHeadRow = document.createElement("tr");
    const DOM_tableBody = document.createElement("tbody");

    DOM_table.appendChild(DOM_tableHead);
    DOM_tableHead.appendChild(DOM_tableHeadRow);
    DOM_table.appendChild(DOM_tableBody);

    this.initializer.forEach((element) => {
      DOM_tableHeadRow.appendChild(this._DOM_createHeadCell(element.name));
      this.numberOfColumns++;
    });

    this.DOM_table = DOM_table;
    this.DOM_tableBody = DOM_tableBody;

    const DOM_resetButton = document.createElement("button");
    DOM_resetButton.classList.add("reset");
    DOM_resetButton.textContent = "Reset table";

    DOM_resetButton.addEventListener("click", () => {
      const res = window.confirm(
        "Are you sure you want to reset this table? This action will permanently delete all data and cannot be undone. All rows, entries, and information currently stored in the table will be lost forever."
      );

      if (res) {
        this.reset();
      }
    });

    this.DOM_tableContainer.appendChild(DOM_table);
    this.DOM_tableContainer.appendChild(DOM_resetButton);
  }

  _initializeDefault() {
    console.log("initializeDefault");
    {
      // IncipentRow
      this.DOM_tableBody.appendChild(this._DOM_createIncipientRow());
    }
  }

  _initializeState(state) {
    console.log("initializeState", state);

    this.numberOfRows = parseInt(state[0]);
    this.numberOfColumns = parseInt(state[1]);

    console.log(this.numberOfRows, this.numberOfColumns);

    for (let i = 0; i < this.numberOfRows; i++) {
      const DOM_tr = this._DOM_createRow();

      for (let j = 0; j < this.numberOfColumns; j++) {
        DOM_tr.childNodes.item(j).firstChild.value =
          state[i * this.numberOfColumns + j + 2];
      }

      this.DOM_tableBody.appendChild(DOM_tr);
    }

    {
      // LastRow
      this._convertRowToLastRow(
        this.DOM_tableBody.childNodes.item(this.numberOfRows - 1)
      );
    }

    {
      // IncipientRow
      this.DOM_tableBody.appendChild(this._DOM_createIncipientRow());
    }
  }

  _stringify(object) {
    return object.join(",");
  }

  _parse(string) {
    return string?.split(",");
  }

  reset() {
    // this._initializeDefault();
  }

  save() {
    if (this.numberOfRows === 0) {
      localStorage.removeItem(this.key);
      return;
    }

    function getCellValue(DOM_node, indexRow, indexColumn) {
      return DOM_node.childNodes.item(indexRow).childNodes.item(indexColumn)
        .firstChild.value;
    }

    const v = [this.numberOfRows.toString(), this.numberOfColumns.toString()];

    for (let i = 0; i < this.numberOfRows; i++) {
      for (let j = 0; j < this.numberOfColumns; j++) {
        v.push(getCellValue(this.DOM_tableBody, i, j));
      }
    }

    console.log("stored", this._stringify(v));
    window.localStorage.setItem(this.key, this._stringify(v));
  }

  load() {
    this._initializeTable();
    const v = this._parse(localStorage.getItem(this.key));

    const isValid = () => {
      if (v == null) {
        return false;
      }

      if (!Array.isArray(v)) {
        return false;
      }

      if (v.length < 2 + this.initializer.length) {
        return false;
      }

      if (isNaN(parseInt(v[0])) || isNaN(parseInt(v[1]))) {
        return false;
      }

      if (this.initializer.length !== parseInt(v[1])) {
        return false;
      }

      if (parseInt(v[0]) * parseInt(v[1]) + 2 !== v.length) {
        return false;
      }

      return true;
    };

    if (isValid()) {
      this._initializeState(v);
    } else {
      this._initializeDefault();
    }

    console.log("loaded!!");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.tcsTable = new DynamicTable(
    document.querySelector("#tcs_table-container.table-container"),
    [
      { name: "Name" },
      { name: "Tier (%)" },
      {
        name: "Final price",
        f: function (data, indexRow, indexColumn) {
          const tier = parseInt(data.table[indexRow][1]);

          return (data.ticket * (tier + 100)) / 100;
        },
      },
    ],
    "tcs"
  );

  window.dreampassTable = new DynamicTable(
    document.querySelector("#dreampass_table-container.table-container"),
    [
      { name: "Name" },
      { name: "Dreampass price" },
      {
        name: "Final price",
        f: function (data, indexRow, indexColumn) {
          const dreampassPrice = parseInt(data.table[indexRow][1]);
          return parseInt(data.ticket) + dreampassPrice;
        },
      },
    ],
    "dreampass"
  );

  window.lostBaggageTable = new DynamicTable(
    document.querySelector("#lost-baggage_table-container.table-container"),
    [
      { name: "Name" },
      { name: "Lost baggage charges" },
      {
        name: "Final price",
        f: function (data, indexRow, indexColumn) {
          const dreampassPrice = parseInt(data.table[indexRow][1]);
          return parseInt(data.ticket) + dreampassPrice;
        },
      },
    ],
    "lost-baggage"
  );

  const DOM_inputs = document.querySelectorAll("input.input");

  DOM_inputs.forEach((DOM_input) => {
    DOM_input.addEventListener("input", window.tcsTable.computeTable);
    DOM_input.addEventListener("input", window.dreampassTable.computeTable);
    DOM_input.addEventListener("input", window.lostBaggageTable.computeTable);
  });

  function save() {
    const state = Array.from(DOM_inputs).map((DOM_input) => DOM_input.value);

    let isEmpty = true;

    {
      for (let i = 0; i < DOM_inputs.length; i++) {
        if (DOM_inputs[i] != "") {
          isEmpty = false;
        }
      }
    }

    if (isEmpty) {
      return;
    }

    window.localStorage.setItem("inputs", state.join(","));
  }

  function load() {
    const v = window.localStorage.getItem("inputs")?.split(",");

    if (v == null) {
      return;
    }

    v.forEach((e, i) => {
      DOM_inputs[i].value = e;
    });
  }

  window.tcsTable.load();
  window.dreampassTable.load();
  window.lostBaggageTable.load();
  load();

  window.addEventListener("unload", () => {
    window.tcsTable.save();
    window.dreampassTable.save();
    window.lostBaggageTable.save();
    save();
  });
});
