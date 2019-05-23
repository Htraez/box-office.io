function staffForm(){
    $("#staffForm").show();
    $(".content-view").hide();
}

function cancelStaff(){
    $("#staffForm").hide();
    $(".content-view").show();
}

$(document).on("click","#createStaff",staffForm);
$(document).on("click","#cancelStaff",cancelStaff);
