class DynamicTable {
  constructor(DOM_container) {
    this.DOM_tableContainer = DOM_container;
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

  _callback_lastRowCell = ((event) => {
    this._popEmptyRows();
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

  _computeRow() {}
  _computeTable() {}

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

    [
      { name: "Name" },
      { name: "Tier" },
      {
        name: "Price",
        f: function () {
          return 0;
        },
      },
      {
        name: "Ticket + TCS",
        f: function () {
          return 0;
        },
      },
    ].forEach((element) => {
      DOM_tableHeadRow.appendChild(this._DOM_createHeadCell(element.name));
      this.numberOfColumns++;
    });

    this.DOM_table = DOM_table;
    this.DOM_tableBody = DOM_tableBody;

    this.DOM_tableContainer.appendChild(DOM_table);
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
      const DOM_tr = document.createElement("tr");

      for (let j = 0; j < this.numberOfColumns; j++) {
        const DOM_td = this._DOM_createCell(
          state[i * this.numberOfColumns + j + 2]
        );
        DOM_tr.appendChild(DOM_td);
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

  save() {
    if (this.numberOfRows === 0) {
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
    window.localStorage.setItem("dynamicTable", this._stringify(v));
  }

  load() {
    this._initializeTable();
    const v = this._parse(localStorage.getItem("dynamicTable"));

    if (v == null) {
      this._initializeDefault();
    } else {
      this._initializeState(v);
    }

    console.log("loaded!!");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.dynamicTable = new DynamicTable(
    document.querySelector(".table-container")
  );

  window.dynamicTable.load();

  window.addEventListener("unload", () => {
    window.dynamicTable.save();
  });
});
