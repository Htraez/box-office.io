
var theater
var branch

function ScheduleInfo(data) {
    var payload = { table:"schedule" };
    $("#Schedule").find('tr').remove();
    console.log('A');
    $.post('/fetchData',payload,(data)=>{
        data.forEach((value,key)=>{
            
            $("#Schedule").append('<tr class="default-mouse clickTable"><th class="text-white movieTable" scope="col"value="'+value.ScheduleNo+'">'+value.ScheduleNo+'&emsp;'+value.MovieNo+'&emsp;'+value.TheatreCode+'</th></tr>');
        });
        console.log(data)
    });
    
}
function showbranch(data) {
    var payload = { table:"branch" };
    $.post('/fetchData',payload,(data)=>{
        data.forEach((value,key)=>{
            
            $("#Branch").append('<li class="clickTableBranch" value="100value.BranchNo">'+value.BranchName+'</li>');
        });
        console.log(data)
    });
    
}
function showTheater(cl,data) {
    var payload = { table:"theatre" };
    $("#theater").find('li').remove()
    $.post('/fetchData',payload,(data)=>{
        data.forEach((value,key)=>{
            if(cl==value.BranchNo)
            $("#theater").append('<li class="clickTable">'+value.TheatreCode+'</li>');
            
        });
        console.log(data)
    });
    
}

function sentMovieForm(){
    var payload = {
        Movie : {
        MovieName: $('#MovieName').val(),
        Director: $('#Director').val(),
        Casts: $('#Casts').val(),
        Desc: $('#Desc').val(),
        Duration: $('#Duration').val(),
        Rate: $('#Rate').val(),
        Genre: $('#Genre').val(),
        Studio: $('#Studio').val(),
        PosterURL: $('#PosterURL').val()},
     Schdule : {
        TheatreCode: theater,
        Date: $('#Date').val(),
        Time: $('#datetime24').val(),
        Audio: $('#Audio').val(),
        Dimension: $('#Dimension').val(),
        Subtitle: $('#SubTitle').val()
     }
    };
    console.log(payload)
    if(payload.MovieName!='') $.post('/Movies',payload,(res)=>{
        console.log(success)
        
    });
}

function datetime(){
    $('#datetime24').combodate();  
}
function branch(){
    $(this).addClass('selected').siblings().removeClass('selected')
    console.log(this.va);
    var temp = this.innerHTML;
    branchName = temp.replace(/\D/g, "");
    console.log(branchName)
    showTheater(branchName,);

}
function theater(){
    $(this).addClass('selected').siblings().removeClass('selected')
    console.log(this.innerHTML);
    theater = this.innerHTML;
    console.log(theater)

}


function callMovieForm(){
    $('#movieAndSchduleForm').show();
    $('.content-view').hide();
}
function ShowMovieForm(){
    $('#ShowMovieAll').show();
    $('.content-view').hide();
}
// function callScheduleForm(){
//     $('#schduleForm').show();
//     $('#movieForm').hide();
//     branch = $('#Branch').val()
//     showTheater();
// }
// function callBackMovieForm(){
//     $('#schduleForm').hide();
//     $('#movieForm').show();
// }
function callBackFromShow(){
    $('#ShowMovieAll').hide();
    $('.content-view').show();
}
// function callBackFromMovie(){
//     $('#movieForm').hide();
//     $('.content-view').show();
// }


 $(document).on('click',".clickTable", theater);
 $(document).on('click',".clickTableBranch", branch);

$(document).on("click","#createMovie", callMovieForm);
$(document).on("click","#ShowMovie", ShowMovieForm);

// $(document).on("click","#next", callScheduleForm);
// $(document).on("click","#back", callBackMovieForm);
$(document).on("click","#backToAdmin", callBackFromShow);
// $(document).on("click","#Reject", callBackFromMovie);
// $(document).on("click","#createSchedule", sentMovieForm);

ScheduleInfo();
showbranch();

