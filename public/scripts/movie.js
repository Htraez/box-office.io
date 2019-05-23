function BranchOption(){
    var payload = { table:"branch" };
    $.post('/fetchData',payload,(data)=>{
        data.forEach((value,key)=>{
            // if(value.Position=="manager")
            $("#Branch").append('<option class="form-control-plaintext" value="'+value.BranchNo+'">'+value.BranchName+'</option>');
        });
        console.log(data)
    });
}

function callMovieForm(){
    $('#movieAndSchduleForm').show();
    $('.content-view').hide();
}

function callScheduleForm(){
    $('#schduleForm').show();
    $('#movieForm').hide();
    
}

function callBackMovieForm(){
    $('#schduleForm').hide();
    $('#movieForm').show();
}

$(document).on("click","#createMovie", callMovieForm);

$(document).on("click","#next", callScheduleForm);
$(document).on("click","#back", callBackMovieForm);
BranchOption();
