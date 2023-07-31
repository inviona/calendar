var cal = {
  sMon : false, // java nuk fillon te henen
  mName : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], // muajt

  //  te dhenat e kalendarit
  data : null, // ngjarje qe do ndodhin 0
  sDay : 0, sMth : 0, sYear : 0, // te dhenat aktuale per diten e muajn..

 
  hMth : null, hYear : null, // month/year selektimi
  hForm : null, hfHead : null, hfDate : null, hfTxt : null, hfDel : null, // event form

  // INIT CALENDAR
  init : () => {
    // GET + SET COMMON HTML ELEMENTS
    cal.hMth = document.getElementById("cal-mth");
    cal.hYear = document.getElementById("cal-yr");
    cal.hForm = document.getElementById("cal-event");
    cal.hfHead = document.getElementById("evt-head");
    cal.hfDate = document.getElementById("evt-date");
    cal.hfTxt = document.getElementById("evt-details");
    cal.hfDel = document.getElementById("evt-del");
    document.getElementById("evt-close").onclick = cal.close;
    cal.hfDel.onclick = cal.del;
    cal.hForm.onsubmit = cal.save;

    // data tani
    let now = new Date(),
        nowMth = now.getMonth(),
        nowYear = parseInt(now.getFullYear());

    //  PERZGJEDHeSIN E MUAJVE
    for (let i=0; i<12; i++) {
      let opt = document.createElement("option");
      opt.value = i;
      opt.innerHTML = cal.mName[i];
      if (i==nowMth) { opt.selected = true; }
      cal.hMth.appendChild(opt);
    }
    cal.hMth.onchange = cal.list;

    
    for (let i=nowYear-2; i<=nowYear+2; i++) {
      let opt = document.createElement("option");
      opt.value = i;
      opt.innerHTML = i;
      if (i==nowYear) { opt.selected = true; }
      cal.hYear.appendChild(opt);
    }
    cal.hYear.onchange = cal.list;

    //  FILLIMI - VIZATOJE KALENDARIN
    cal.list();
  },

  // KALENDARIN PËR MUAJIN E ZGJEDHUR
  list : () => {
  
    cal.sMth = parseInt(cal.hMth.value); // selekton muaj
    cal.sYear = parseInt(cal.hYear.value); // selekton vitin
    let daysInMth = new Date(cal.sYear, cal.sMth+1, 0).getDate(), // numri i diteve
        startDay = new Date(cal.sYear, cal.sMth, 1).getDay(), // dita e pare e muajt
        endDay = new Date(cal.sYear, cal.sMth, daysInMth).getDay(), // dita e fundit e muajt
        now = new Date(), // dita sot
        nowMth = now.getMonth(), // muaj aktual
        nowYear = parseInt(now.getFullYear()), // viti aktual
        nowDay = cal.sMth==nowMth && cal.sYear==nowYear ? now.getDate() : null ;

    // NGARKONI TË DHËNAT NGA LOCALSTORAGE
    cal.data = localStorage.getItem("cal-" + cal.sMth + "-" + cal.sYear);
    if (cal.data==null) {
      localStorage.setItem("cal-" + cal.sMth + "-" + cal.sYear, "{}");
      cal.data = {};
    } else { cal.data = JSON.parse(cal.data); }

    
    // hapsire para krijimit te muajt
    let squares = [];
    if (cal.sMon && startDay != 1) {
      let blanks = startDay==0 ? 7 : startDay ;
      for (let i=1; i<blanks; i++) { squares.push("b"); }
    }
    if (!cal.sMon && startDay != 0) {
      for (let i=0; i<startDay; i++) { squares.push("b"); }
    }

    // ditet e muajt
    for (let i=1; i<=daysInMth; i++) { squares.push(i); }

    // hapsir bosh pas fundit të muaji
    if (cal.sMon && endDay != 0) {
      let blanks = endDay==6 ? 1 : 7-endDay;
      for (let i=0; i<blanks; i++) { squares.push("b"); }
    }
    if (!cal.sMon && endDay != 6) {
      let blanks = endDay==0 ? 6 : 6-endDay;
      for (let i=0; i<blanks; i++) { squares.push("b"); }
    }

  
    // Get container
    let container = document.getElementById("cal-container"),
    cTable = document.createElement("table");
    cTable.id = "calendar";
    container.innerHTML = "";
    container.appendChild(cTable);

    // rrjeshti i pare ditet
    let cRow = document.createElement("tr"),
        days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
    if (cal.sMon) { days.push(days.shift()); }
    for (let d of days) {
      let cCell = document.createElement("td");
      cCell.innerHTML = d;
      cRow.appendChild(cCell);
    }
    cRow.classList.add("head");
    cTable.appendChild(cRow);

    // Dditet e muajt
    let total = squares.length;
    cRow = document.createElement("tr");
    cRow.classList.add("day");
    for (let i=0; i<total; i++) {
      let cCell = document.createElement("td");
      if (squares[i]=="b") { cCell.classList.add("blank"); }
      else {
        if (nowDay==squares[i]) { cCell.classList.add("today"); }
        cCell.innerHTML = `<div class="dd">${squares[i]}</div>`;
        if (cal.data[squares[i]]) {
          cCell.innerHTML += "<div class='evt'>" + cal.data[squares[i]] + "</div>";
        }
        cCell.onclick = () => { cal.show(cCell); };
      }
      cRow.appendChild(cCell);
      if (i!=0 && (i+1)%7==0) {
        cTable.appendChild(cRow);
        cRow = document.createElement("tr");
        cRow.classList.add("day");
      }
    }

    //heqim ngjarjet
    cal.close();
  },

  // SHFAQ NGJARJEN E EDITIMIT
  show : (el) => {
    // FETCH EXISTING DATA
    cal.sDay = el.getElementsByClassName("dd")[0].innerHTML;
    let isEdit = cal.data[cal.sDay] !== undefined ;

    // UPDATE EVENT FORM
    cal.hfTxt.value = isEdit ? cal.data[cal.sDay] : "" ;
    cal.hfHead.innerHTML = isEdit ? "EDIT EVENT" : "ADD EVENT" ;
    cal.hfDate.innerHTML = `${cal.sDay} ${cal.mName[cal.sMth]} ${cal.sYear}`;
    if (isEdit) { cal.hfDel.classList.remove("ninja"); }
    else { cal.hfDel.classList.add("ninja"); }
    cal.hForm.classList.remove("ninja");
  },

  
  close : () => {
    cal.hForm.classList.add("ninja");
  },

  // e bej save
  save : () => {
    cal.data[cal.sDay] = cal.hfTxt.value;
    localStorage.setItem(`cal-${cal.sMth}-${cal.sYear}`, JSON.stringify(cal.data));
    cal.list();
    return false;
  },

  // FSHI NGJARJEN PER DATEN E ZGJEDHUR
  del : () => { if (confirm("Delete event?")) {
    delete cal.data[cal.sDay];
    localStorage.setItem(`cal-${cal.sMth}-${cal.sYear}`, JSON.stringify(cal.data));
    cal.list();
  }}
};
window.addEventListener("load", cal.init);
