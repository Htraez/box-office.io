function staffForm(){
    $("#staffForm").show();
    $(".content-view").hide();
}

function cancelStaff(){
    $("#staffForm").hide();
    $(".content-view").show();
}

function next(){
    $("#staffForm").hide();
    $("#addShift").show();
}

function back(){
    $("#staffForm").show();
    $("#addShift").hide();
}

$(document).on("click","#createStaff",staffForm);
$(document).on("click","#cancelStaff",cancelStaff);
$(document).on("click","#next",next);
$(document).on("click","#back",back)