//var Theatre = [{Name:'Add New Theatre',Branch:'NULL',Detail:{Type:'Create',Old:''}},{Name:'TH01',Branch:'1',Detail:{Type:'Load',Old:''}},{Name:'TH02',Branch:'2',Detail:{Type:'Load',Old:''}},{Name:'TH03',Branch:'3',Detail:{Type:'Load',Old:''}},{Name:'TH04',Branch:'4',Detail:{Type:'Load',Old:''}}];
var Theatre = [{Name:'Add New Theatre',Branch:'NULL',Detail:{Type:'Create',Old:''}}];
var SeatClass,PlanHeight=0,PlanWidth=0;
var OpSeatCount=1
    Thcount=0
    nowTH=0;
var renderCount = [1,1,1,1];

//-------------------------------------Theatre Function--------------------------------------------

function addTable(data) {
    data.forEach((value, key) => {
        var tableRowappend = '<tr id="Th'+Thcount+'" class="default-mouse" ><th onclick="editTh('+Thcount+')" class="text-white pl-3" scope="col">'+value.Name+'</th>'
        if(Thcount>0) tableRowappend += '<th class="text-white" onclick="removeTh('+Thcount+')" scope="col">X</th>';
        else tableRowappend += '<th onclick="editTh(0)"></th>';
        tableRowappend += '</tr>';
        Thcount++;
        if(value.Detail.Type!='Delete')$("#MyTableTr").append(tableRowappend);
    });
    $('#Th'+nowTH).addClass('bg-secondary').siblings().removeClass('bg-secondary');
}

function reRenderTHTable(){
    $('.alert').hide()
    for(var i = Thcount-1 ; i >= 0 ; i--) {
        $('#Th'+i).remove();
        Thcount--;
    }
    addTable(Theatre);
}

function removeTh(id){
    var THName = $('#Th'+id)[0].childNodes[0].innerHTML;
    switch(Theatre[id].Detail.Type){
        case 'Create' : Theatre.splice(Theatre.findIndex((val)=>{return val.Name==THName}),1); break;
        case 'Load' : Theatre[id].Detail = {Type: 'Delete',Old: Theatre[id].Name}; break;
        case 'Update' : Theatre[id].Detail.Type = 'Delete'; break;
    }
    $('#NameTheatre').val('');
    $('#TheatreBranch').val('');
    reRenderTHTable();
    nowTH = 0;
}

function editTh(id){
    $('#Th'+id).addClass('bg-secondary').siblings().removeClass('bg-secondary');
    if(id>0){
        $('#NameTheatre').val(Theatre[id].Name);
        $('#TheatreBranch').val(Theatre[id].Branch);
    }
    else $('#NameTheatre').val('');
    nowTH=id;
}

function saveTheatre(){
    var data = {Name:$('#NameTheatre').val(), Branch:$('#TheatreBranch').val(),Detail:{Type:'Create',Old:''}}
    if(data.Name!='' && data.Branch){
        $('#NameTheatre').val('');
        if(nowTH==0){
            addTable([data]);
            Theatre.push(data);
        }
        else {
            switch (Theatre[nowTH].Detail.Type){
                case 'Load': data.Detail = {Type:'Update',Old:Theatre[nowTH].Name}; break;
                case 'Update' : data.Detail = Theatre[nowTH].Detail; break;
                default : break;
            }
            Theatre[nowTH] = data;
            reRenderTHTable();
        }
        iziToast.show({
            position: "topCenter", 
            icon: "far fa-thumbs-up",
            title: 'Save!', 
            color: 'green',
            position: 'bottomLeft',
            timeout: 2000,
            message: 'You Theatre is save successfully.',
        });
        
    }
    else {
        iziToast.show({
            position: "topCenter", 
            icon: "fas fa-exclamation-circle",
            title: 'Warning!', 
            color: 'red',
            position: 'bottomLeft',
            timeout: 2000,
            message: 'You should check input in on some of those fields below.',
        });
    }
}

function addBranchOption(){
    $.get('/fetchData/branch/none',(data)=>{
            data.forEach((value,key)=>{
            $("#TheatreBranch").append('<option class="form-control-plaintext" value="'+value.BranchNo+'">'+value.BranchName+'</option>');
        })
    });
}

//-------------------------------------Plan Function--------------------------------------------

function planH(){
    PlanHeight = parseFloat(document.getElementById("PlanHeight").value);
    $('#showH')[0].childNodes[0].data = 'Plan Height '+PlanHeight+' m.';
    document.getElementById("PlanHeight").value = PlanHeight;
}

function planW(){
    PlanWidth = parseFloat(document.getElementById("PlanWidth").value);
    $('#showW')[0].childNodes[0].data = 'Plan Width '+PlanWidth+' m.';
    document.getElementById("PlanWidth").value = PlanWidth;
    reRenderSeat();
}

function appendSeatClass(number) {
    SeatClass.forEach((value,key)=>{
        $("#SeatClass"+number).append('<option class="form-control-plaintext" value="'+value.ClassName+'">'+value.ClassName+'</option>');
    });   
}

function getSeatClass(){
    $.get('/fetchData/seatclass/none',(data)=>{
            SeatClass = data;
            appendSeatClass(1);
            iziToast.destroy();
    });
}

function addSeat() {
    if(OpSeatCount<=4){
        $("#adj").append('<div id="SeatForm'+OpSeatCount+'" class="form-group row mb-0"><label for="SeatClass'+OpSeatCount+'" class="col-md-2 mt-2 mb-0" style="padding-left: 13px;">Seat Class '+OpSeatCount+'</label><div class="col-md-3 col-sm-3 col-3"><select name="SeatClass'+OpSeatCount+'" id="SeatClass'+OpSeatCount+'" onchange="reRenderSeat()" class="form-control-plaintext text-white"></select></div><label for="NoRow'+OpSeatCount+'" class="col-md-2 col-sm-3 col-3 mt-2 mb-0">No.Row</label><div class="col-md-3 col-sm-3 col-3"><button type="button" onclick="deleteSeatTH('+OpSeatCount+')" class="btn text-center text-white btn-white-rounded m-0 pl-2" style="width: 20px !important; min-width: 0px;" >-</button><input type="number" class="mt-2 custom-range text-white" readonly="readonly" style="text-align: center;width: 27px; border: 0px;" min="0" value="0" id="NoRow'+OpSeatCount+'" name="NoRow'+OpSeatCount+'"><button type="button" onclick="appendSeatTH('+OpSeatCount+')" class="btn text-center text-white btn-white-rounded m-0 pl-2" style="width: 24px !important; min-width: 0px;" >+</button></div><div></div></div>');
        if(OpSeatCount>1)appendSeatClass(OpSeatCount);
        OpSeatCount++;
    }
    return 1;
}

function removeSeat() {
    if(OpSeatCount>2) {
        clearSeat(--OpSeatCount);
        $('#SeatForm'+OpSeatCount).remove();
    }
}

function changeValR(op,num) {
    var value = parseFloat($('#NoRow'+num).val());
    if(op===1){
        $('#NoRow'+num).val(value+1);
    }
    else{
        $('#NoRow'+num).val(value-1);
    }
}

function appendSeatTH(num){
    var use=0,min=9999;
    if(SeatClass != null && PlanWidth>0){
        for(var i = 1; i < OpSeatCount; i++){
            var seatHeight = SeatClass.find((val)=>{ return val.ClassName==$('#SeatClass'+i).val()}).Height;
            //console.log(temp+"*"+(renderCount[i-1]-1));
            use += (seatHeight*(renderCount[i-1]-1));
        }
        var SeatClassData = SeatClass.find((val)=>{ return val.ClassName==$('#SeatClass'+num).val()});
        if(PlanHeight-use>=SeatClassData.Height && SeatClassData.Width<=PlanWidth){
            var seat = '<div id="render'+num+'R'+renderCount[num-1]+'" class="container-fluid pl-0 pr-0 mt-3 mb-3 d-flex justify-content-between" >'
            for (let i = 0; i < PlanWidth/SeatClassData.Width; i++) {
                seat += '<span class="dot ml-1 mr-1"></span>';
            }
            seat += '</div>'
            //console.log(seat);
            $('#render'+num).append(seat);
            renderCount[num-1]++;
            changeValR(1,num);
        }
    }
    return 1;
}

function deleteSeatTH(num) {
    if(renderCount[num-1]>1){
        renderCount[num-1]--;
        $('#render'+num+'R'+renderCount[num-1]).remove();
        changeValR(0,num);
    }
}

function clearSeat(num) {
    while(renderCount[num-1]>1){
        deleteSeatTH(num);
    }
}

function reRenderSeat() {
    let tempCount = [...renderCount];
    for(var i=OpSeatCount; i>1; i--){
        clearSeat(i-1);
        for(var j=1; j<tempCount[i-2]; j++){
            appendSeatTH(i-1);
        }
    }
}

//-------------------------------------Plan Form Function--------------------------------------------

$(document).on("keypress", "form", function(event) { 
    return event.keyCode != 13;
});

function pageRedirect() {
    window.location.href = "http://localhost:8080/plan";
} 

function sentPlanForm() {
    var temp = [...Theatre];
    //temp.shift();
    var payload = {
        PlanName: $('#PlanName').val(),
        PlanHeight: PlanHeight,
        PlanWidth: PlanWidth,
        SeatClass1: $('#SeatClass1').val(),
        NoRow1: $('#NoRow1').val(),
        SeatClass2: $('#SeatClass2').val(),
        NoRow2: $('#NoRow2').val(),
        SeatClass3: $('#SeatClass3').val(),
        NoRow3: $('#NoRow3').val(),
        SeatClass4: $('#SeatClass4').val(),
        NoRow4: $('#NoRow4').val(),
        Theatre: temp.slice(1,temp.length)
    };
    if(payload.PlanName!='' && PlanHeight>0 && PlanWidth>0) $.post('/plan',payload,(res)=>{
        $('#plan-success').fadeTo(2000, 500).slideUp(500, function(){
            $(this).hide();
            cancelPlan();
        });
        //pageRedirect();
    });
    else $('#plan-warning').fadeTo(2000, 500).slideUp(500, function(){
        $(this).hide(); 
    });
}

function LoadDataEditForm(PlanName){
    $.get('/fetchData/plan/PlanName='+PlanName,(data)=>{
        while(OpSeatCount>2){removeSeat();}
        clearSeat(1);
        //console.log(data);
        var getdata = data[0];
        if(getdata){
            $('#PlanName').val(getdata.PlanName);
            document.getElementById("PlanHeight").value = getdata.PlanHeight;
            document.getElementById("PlanWidth").value = getdata.PlanWidth;
            planH();
            planW();
            getdata.SeatClass1&&$('#SeatClass1').val(getdata.SeatClass1)&&$('#NoRow1').val(getdata.NumberRow1)&&(renderCount[0]+=getdata.NumberRow1);
            getdata.SeatClass2&&addSeat()&&$('#SeatClass2').val(getdata.SeatClass2)&&$('#NoRow2').val(getdata.NumberRow2)&&(renderCount[1]+=getdata.NumberRow2);
            getdata.SeatClass3&&addSeat()&&$('#SeatClass3').val(getdata.SeatClass3)&&$('#NoRow3').val(getdata.NumberRow3)&&(renderCount[2]+=getdata.NumberRow3);
            getdata.SeatClass4&&addSeat()&&$('#SeatClass4').val(getdata.SeatClass4)&&$('#NoRow4').val(getdata.NumberRow4)&&(renderCount[3]+=getdata.NumberRow4);
            reRenderSeat();
        }
    });
    $.get('/fetchData/theatre/PlanName='+PlanName,(data)=>{
        console.log(data);
        Theatre = [{Name:'Add New Theatre',Branch:'NULL',Detail:{Type:'Create',Old:''}}];
        data.forEach((value)=>{
            Theatre.push({Name: value.TheatreCode, Branch: ''+value.BranchNo+'', Detail:{Type:'Load',Old:''}});
        });
        reRenderTHTable();
    });
}

function cancelPlan() {
    $('.content-view').show();
    $('.content-form').hide();
    $('#listPlanTable').find('li').remove();
    getPlanList();
}

function callPlanForm(err,PlanName = null) {
    iziToast.show({
        position: "topCenter", 
        iconUrl: '/assets/images/load_placeholder.svg',
        title: 'Fetching Data', 
        color: 'green',
        message: 'Please Wait',
        timeout: false,
        overlay: true,
        close: false
    });
    Theatre = [{Name:'Add New Theatre',Branch:'NULL',Detail:{Type:'Create',Old:''}}];
    reRenderTHTable();
    PlanHeight=0;PlanWidth=0;OpSeatCount=1;Thcount=0;nowTH=0;renderCount = [1,1,1,1];
    $('#PlanName').val('');
    document.getElementById("PlanHeight").value = 0;
    document.getElementById("PlanWidth").value = 0;
    planH();planW();
    $('#TheatreBranch').find('option').remove();
    $('.renderSeatPlan').find('div').remove();
    $('#Th0').remove();
    removeSeat();
    $('#adj').find('div').remove();
    $('#planForm').show();
    $('.content-view').hide();
    addSeat();
    addTable(Theatre);
    addBranchOption();
    getSeatClass();
    if(PlanName){
        LoadDataEditForm(PlanName);
        console.log(PlanName);
    }
}

$(document).on("click","#createPlan", callPlanForm);

function addListPlanTable(data) {
    data.forEach((value, key) => {
        //var tableRowappend = '<tr class="default-mouse planTable" ><th style="border:1px solid white;" class="text-white pl-3" scope="col">'+value.PlanName+'</th></tr>'
        var tableRowappend = "<li class='planTable'>"+value.PlanName+"</li>";
        $("#listPlanTable").append(tableRowappend);
    });
    //$('#Th'+nowTH).addClass('bg-secondary').siblings().removeClass('bg-secondary');
}

$(document).on("click",".planTable",function (){
    $(this).addClass('selected').siblings().removeClass('selected');
    $.get('/fetchData/plan/PlanName='+this.innerHTML,(data)=>{
        $('#viewPlanName').text(data[0].PlanName);
        $('#viewPlanWidth').text("Width : "+data[0].PlanWidth+" m.");
        $('#viewPlanHeight').text("Height : "+data[0].PlanHeight+" m.");
        $(this).addClass('bg-secondary').siblings().removeClass('bg-secondary');
    });
});

$(document).on("click","#callEditPlanForm",function(){
    callPlanForm("",$('#viewPlanName').text());
});

$(document).on("click","#callDeletePlanForm",function(){
    console.log("Delete");
});

function getPlanList(){
    $.get('/fetchData/plan/none',(data)=>{
            addListPlanTable(data);
    });
}
getPlanList();