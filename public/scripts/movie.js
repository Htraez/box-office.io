var theater




function BranchOption(){
    var payload = { table:"branch" };
    $.post('/fetchData',payload,(data)=>{
        data.forEach((value,key)=>{
            
            $("#Branch").append('<option class="form-control-plaintext" value="'+value.BranchNo+'">'+value.BranchName+'</option>');
        });
        console.log(data)
    });
}



function ScheduleInfo(data) {
    var payload = { table:"schedule" };
    $.post('/fetchData',payload,(data)=>{
        data.forEach((value,key)=>{
            
            $("#Schedule").append('<tr class="default-mouse clickTable"><th class="text-white movieTable" scope="col"value="'+value.ScheduleNo+'">'+value.ScheduleNo+'&emsp;'+value.MovieNo+'&emsp;'+value.TheatreCode+'</th></tr>');
        });
        console.log(data)
    });
    
}




function callMovieForm(){
    $('#movieAndSchduleForm').show();
    $('.content-view').hide();
}

function ShowMovieForm(){
    $('#ShowMovieAll').show();
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
$(document).on("click","#ShowMovie", ShowMovieForm);

$(document).on("click","#next", callScheduleForm);
$(document).on("click","#back", callBackMovieForm);
BranchOption();
ScheduleInfo();