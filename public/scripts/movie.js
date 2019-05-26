var theater;
var branchName;
var schedule_list =[];
var Schedule_select;
var test;
var Movies;
var MovieSchedule =[];
var MovieEdit;
var Branch =[];
var TheatreA =[];

function ScheduleInfo(cl,data) {
    $("#Schedule").find('li').remove();
    MovieSchedule.forEach((value,key)=>{
            if(cl==value.MovieNo){
                $("#Schedule").append('<tr value="'+value.ScheduleNo+'" class="scheduleTable"><td>'+value.ScheduleNo+'</td><td>'+value.MovieNo+'</td><td>'+value.TheatreCode+'</td><td>'+value.Date+'</td><td>'+value.Time+'</td><td>'+value.Audio+'</td><td>'+value.Dimension+'</td><td>'+value.Subtitle+'</td></tr>'); 
            }
    });
    
}

function MovieInfo(cl,data) {
    $("#MovieInfo").find('li').remove();
    MovieSchedule.forEach((value,key)=>{
            if(cl==value.MovieNo){
                if($(".infotable[mv-uq='"+value.MovieNo+"']").length==0){
                    $("#MovieInfo").append('<li class="infotable"mv-uq="'+value.MovieNo+'">'+"MovieName:"+value.MovieName+'&emsp;</li>');
                    $("#MovieInfo").append('<li class="infotable"mv-uq="'+value.MovieNo+'">'+"Director:"+value.Director+'&emsp;</li>');
                    $("#MovieInfo").append('<li class="infotable"mv-uq="'+value.MovieNo+'">'+"Casts:"+value.Casts+'&emsp;</li>');
                    $("#MovieInfo").append('<li class="infotable"mv-uq="'+value.MovieNo+'">'+"Rate:"+value.Rate+'&emsp;</li>');
                    $("#MovieInfo").append('<li class="infotable"mv-uq="'+value.MovieNo+'">'+"Genre:"+value.Genre+'&emsp;</li>');
                    $("#MovieInfo").append('<li class="infotable"mv-uq="'+value.MovieNo+'">'+"Studio:"+value.Studio+'&emsp;</li>');
                    $("#MovieInfo").append('<li class="infotable"mv-uq="'+value.MovieNo+'">'+"Duration:"+value.Duration+"min"+'&emsp;</li>');

                }
            }
    }); 
}
function frechBranch() {
    var payload = { table:"branch" };
    $.post('/fetchData',payload,(data)=>{
        data.forEach((value,key)=>{
                Branch.push ({
                    BranchNo:value.BranchNo,
                    BranchName:value.BranchName,
                    BranchAddress:value.BranchAddress,
                    PhoneNumber:value.PhoneNumber,
                    ManagerStaffNo:value.ManagerStaffNo,
                })
        });
        console.log(Branch)
        showbranch();
    });
}

function frechTheater(){
    var payload = { table:"theatre" };
    $.post('/fetchData',payload,(data)=>{
        data.forEach((value,key)=>{
            TheatreA.push ({
                TheatreCode:value.TheatreCode,
                BranchNo:value.BranchNo,
                PlanName:value.PlanName
            })
        });
    });
        console.log(TheatreA)
        

}

function showbranch() {
    $("#Branch").find('li').remove() 
    $("Branch_add").find('li').remove()
            Branch.forEach((value,key)=>{
            $("#Branch").append('<li class="clickTableBranch" value="'+value.BranchNo+'">'+value.BranchName+'</li>');
        });
        Branch.forEach((value,key)=>{
            $("#Branch_add").append('<li class="clickTableBranch" value="'+value.BranchNo+'">'+value.BranchName+'</li>');
        });

}
function showTheater(cl,data) {
    console.log(cl)
    $("#theater").find('li').remove()
    $("#theater_add").find('li').remove()
        TheatreA.forEach((value,key)=>{
            if(cl==value.BranchNo)
            $("#theater").append('<li class="clickTable">'+value.TheatreCode+'</li>');   
        });
        TheatreA.forEach((value,key)=>{
            if(cl==value.BranchNo)
            $("#theater_add").append('<li class="clickTable">'+value.TheatreCode+'</li>');   
        });
    
    
}

function showmovie(data) {
    $.get('/fetchDataMovie',(data)=>{
        data.forEach((value,key)=>{
            MovieSchedule.push( {
                MovieName: value.MovieName,
                MovieNo: value.MovieNo,
                Director: value.Director,
                Casts: value.Casts,
                Desc: value.Desc,
                Duration: value.Duration,
                Rate: value.Rate,
                Genre: value.Genre,
                Studio: value.Studio,
                PosterURL: value.PosterURL,
                TheatreCode: value.TheatreCode,
                ScheduleNo:value.ScheduleNo,
                Date: value.Date,
                Time: value.Time,
                Audio: value.Audio,
                Dimension: value.Dimension,
                Subtitle: value.Subtitle
            });
        });
        MovieSchedule.forEach((value,key)=>{
            if($(".MovieTable[mv-uq='"+value.MovieNo+"']").length==0){
                    let tempDate = new Date(value.Date)
                    let today = new Date()
                    let isHist = tempDate < today;
                    let histStatus = 'Now';
                    if(isHist) histStatus = 'History';
                    $("#Movie").append('<li data-st="'+histStatus+'" mv-uq="'+value.MovieNo+'" class="MovieTable" value="'+value.MovieNo+'" style="display: none;"  >'+value.MovieName+'</li>');
                    }
         });
         $("[data-st='Now']").show();
         $('body').on('change','#SelectMovieShow',function(){
            console.log("ok");  
            let str = this.value;
              console.log(str);
             $("[data-st="+str+"]").show();
             (str == 'History') ? $("[data-st='Now']").hide() : $("[data-st='History']").hide();
             
            })  
         });
        //  $(document).on('change','#his',function(){
        //     let str = this.data(("+stu"))            })   
        // });
         
        //  $(document).on('change', '#Now',function(){
        //         $("[data-st="+History+"]").hide()
        //         $("[data-st="+Now+"]").show()
        //  });
        //  $(document).on('change', '#History', function(){
        //     console.log("ok")
        //     $("[data-st="+History+"]").show()
        //         $("[data-st="+Now+"]").hide()
        // });
    }

function EditMovie (cl,data){
     if(MovieSchedule.MovieNo=cl){
        console.log(MovieSchedule)
    }
}

function compare(temp){
    var found = 0;
    schedule_list.forEach((value)=>{
        if( value.TheatreCode == temp.TheatreCode && value.Date == temp.Date && value.Time == temp.Time) found=1;
    })
    return found;
}

function addScheduleTable(){
    if($('#DateStart').val()!="" && theater != undefined ){
        var diff = ($('#DateEnd').val()=="") ? 0 : findDiffDate($('#DateStart').val(),$('#DateEnd').val());
        //console.log(diff);
        for(var i = 0; i <= diff ; i++){
            var day = new Date($('#DateStart').val());
            day.setDate(day.getDate()+i);
            var temp = {
                TheatreCode: theater,
                Date: day.toISOString().substring(0, 10),
                Time: $('#datetime24').val(),
                Audio: $('#Audio').val(),
                Dimension: $('#Dimension').val(),
                Subtitle: $('#SubTitle').val()
            }
            console.log(temp)
            if(!compare(temp)) schedule_list.push(temp);
            //console.log(temp);
        }      
    }
    updateSchedule_list(schedule_list);
    // schedule_list.push(temp);
    // updateSchedule_list(schedule_list);
}

function findDiffDate(Start,End){
    end = new Date(End)
    start = new Date(Start)
    diffTime = Math.abs(end.getTime() - start.getTime());
    return (start<end) ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : -1; 
}

function deleteSchedule_list(){
        //$(this).addClass('selected').siblings().removeClass('selected')
        //console.log(this.innerHTML);
        //console.log($(this).attr('value'));
        delete schedule_list[$(this).attr('value')];
        updateSchedule_list(schedule_list);
}

function updateSchedule_list(data){
    $("#schedule-list").find("li").remove();
    $("#schedule-list").append('<li>theaterCode &emsp;&emsp;&emsp;&emsp; Date &emsp;&emsp;&emsp; Audio &emsp;&emsp;&emsp; StartTime &emsp;&emsp;&emsp;Subtitle &emsp;Dimension </li>');
    data.forEach((value,key)=>{
        $("#schedule-list").append('<li class="clickSchedule" value='+key+' >'+value.TheatreCode+'&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;'+value.Date+'&emsp;&emsp;'+value.Audio+'&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;'+value.Time+'&emsp;&emsp;&emsp;&emsp;&emsp;'+value.Subtitle+'&emsp;&emsp;&emsp;&emsp;'+value.Dimension+'&emsp;&emsp;&emsp;&emsp;<span class="deleteSchedule" value="'+key+'">X</span></li>');
    })
}

function addScheduleTable_add(){
    console.log("ok")

    if($('#DateStart_add').val()!="" && theater != undefined ){
        var diff = ($('#DateEnd_add').val()=="") ? 0 : findDiffDate($('#DateStart_add').val(),$('#DateEnd_add').val());
        //console.log(diff);
        for(var i = 0; i <= diff ; i++){
            var day = new Date($('#DateStart_add').val());
            day.setDate(day.getDate()+i);
            var temp = {
                TheatreCode: theater,
                Date: day.toISOString().substring(0, 10),
                Time: $('#datetime24_add').val(),
                Audio: $('#Audio_add').val(),
                Dimension: $('#Dimension_add').val(),
                Subtitle: $('#SubTitle_add').val()
            }
            console.log(temp)
            if(!compare(temp)) schedule_list.push(temp);
            //console.log(temp);
        }      
    }
    updateSchedule_list_add(schedule_list);
    // schedule_list.push(temp);
    // updateSchedule_list(schedule_list);
}



function deleteSchedule_list(){
        //$(this).addClass('selected').siblings().removeClass('selected')
        //console.log(this.innerHTML);
        //console.log($(this).attr('value'));
        delete schedule_list[$(this).attr('value')];
        updateSchedule_list(schedule_list);
}

function updateSchedule_list_add(data){
    $("#schedule-list-add").find("li").remove();
    $("#schedule-list-add").append('<li>theaterCode &emsp;&emsp;&emsp;&emsp; Date &emsp;&emsp;&emsp; Audio &emsp;&emsp;&emsp; StartTime &emsp;&emsp;&emsp;Subtitle &emsp;Dimension </li>');
    data.forEach((value,key)=>{
        $("#schedule-list-add").append('<li class="clickSchedule" value='+key+' >'+value.TheatreCode+'&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;'+value.Date+'&emsp;&emsp;'+value.Audio+'&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;'+value.Time+'&emsp;&emsp;&emsp;&emsp;&emsp;'+value.Subtitle+'&emsp;&emsp;&emsp;&emsp;'+value.Dimension+'&emsp;&emsp;&emsp;&emsp;<span class="deleteSchedule" value="'+key+'">X</span></li>');
    })
}


function DeleteMovie(data) {
    console.log(Movies)
    var payload = {MovieNo : Movies}
    console.log(payload)
    $.ajax({
        type:"DELETE",
        url: "/Deletemovies",
        data: payload,
        success: function(data) {
            window.location.replace("/admin");  
        }
    })
 }

 function DeleteSchedule(data) {
    console.log(Schedule_select)
    var payload = {ScheduleNo : Schedule_select}
    console.log(payload)
    $.ajax({
        type:"DELETE",
        url: "/DeleteSchedule",
        data: payload,
        success: function(data) {
            window.location.replace("/admin");  
        }
    })
 }
 


function createAllSchedules(){
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
        PosterURL: $('#PosterURL').val()
        },
        schedule : [...schedule_list]
    };
    console.log(payload)
     if(payload.Movie.MovieName!=''&&payload.Movie.Director!=''&&payload.Movie.Casts!=''&&payload.Movie.Desc&&payload.Movie.Duration!=''&&payload.Movie.Genre!=''&&payload.Movie.Rate!=''&&payload.Movie.Studio!=''&&payload.Movie.PosterURL!='') {
        $.ajax({
            type:"POST",
            url: "/movies",
            data: payload,
            success: function(data) {
                window.location.replace("/admin");  
            }
        })
     }
     else console.log("error")
}

function branch(){
    $(this).addClass('selected').siblings().removeClass('selected')
    console.log(this.value);
    branchName = this.value;
    console.log(branchName)
    showTheater(branchName,);

}
function select_theater(){
    $(this).addClass('selected').siblings().removeClass('selected')
    console.log(this.innerHTML);
    theater = this.innerHTML;
    console.log(theater)

}

function select_Movie(){
    $(this).addClass('selected').siblings().removeClass('selected')
    console.log(this.value);
    Movies = this.value;
    $('#Schedule').show();
    ScheduleInfo(Movies,);
    MovieInfo(Movies,);
}

function select_Schedule(){
    
    $(this).addClass('selected').siblings().removeClass('selected')
    console.log(this.value);
    Schedule_select =(this.value);
    console.log(Schedule_select);

}

function callMovieForm(){
    $('#movieAndSchduleForm').show();
    $('.content-view').hide();
}

function callBackFromShow(){
    $('#ShowMovieAll').hide();
    $('.content-view').show();
}

function cancelAllSchedule(){
    $('#movieAndSchduleForm').hide();
    $('.content-view').show();
}

function UpdateDataMovie(){
    $('#EditMovieForm').show();
    $('.content-view').hide();
    var temp =[];
    console.log(Movies)
    MovieSchedule.forEach((value,key)=>{
        if(value.MovieNo==Movies){
         temp ={
            MovieName:value.MovieName,
            Director:value.Director,
            Casts:value.Casts,
            Desc:value.Desc,
            Duration:value.Duration,
            Rate:value.Rate,
            Genre:value.Genre,
            Studio:value.Studio,
            PosterURL:value.PosterURL,
            }
        }
        console.log(temp)
    })
    $('#MovieName_Add').val(temp.MovieName);
    $('#Director_Add').val(temp.Director);
    $('#Casts_Add').val(temp.Casts);
    $('#Desc_Add').val(temp.Desc);
    $('#Duration_Add').val(temp.Duration);
    $('#Rate_Add').val(temp.Rate);
    $('#Genre_Add').val(temp.Genre);
    $('#Studio_Add').val(temp.Studio);
    $('#PosterURL_Add').val(temp.PosterURL);
}

function AddDataSchedule(){
    $('#EditScheduleForm').show();
    $('.content-view').hide();
}

function EditMovieSucc(){
    var payload = {
        MovieNo:Movies,
        MovieName: $('#MovieName_Add').val(),
        Director: $('#Director_Add').val(),
        Casts: $('#Casts_Add').val(),
        Desc: $('#Desc_Add').val(),
        Duration: $('#Duration_Add').val(),
        Rate: $('#Rate_Add').val(),
        Genre: $('#Genre_Add').val(),
        Studio: $('#Studio_Add').val(),
        PosterURL: $('#PosterURL_Add').val()
    }
    console.log(payload)
    $.ajax({
        type:"post",
        url: "/moviesUpdate",
        data: payload,
        success: function(data) {
            window.location.replace("/admin");  
        }
    });
}

function addAllSchedule(){
    var payload = {
        Movie : {
        MoveNo :Movies,
        TheatreCode :theater},
        schedule : [...schedule_list]
    };
    console.log(payload)
    $.ajax({
        type:"POST",
        url: "/AddNewSchedule",
        data: payload,
        success: function(data) {
            window.location.replace("/admin");  
        }
    })

}

function addScheduleTable1(){
    
    addScheduleTable_add();
}

$(document).on('click',".clickTable", select_theater);
$(document).on('click',".clickTableBranch", branch);
$(document).on('click',"#addSchedule",addScheduleTable);
$(document).on('click',"#addSchedule1",addScheduleTable1);
$(document).on("click","#backToAdmin", callBackFromShow);
$(document).on("click",".deleteSchedule",deleteSchedule_list);
$(document).on("click","#createAllSchedule", createAllSchedules);   
$(document).on("click","#cancelAllSchedule", cancelAllSchedule);  

// -------admin page-----------
$(document).on("click","#createMovie", callMovieForm);
$(document).on("click","#EditMovie", UpdateDataMovie);
$(document).on("click","#DeleteMovie", DeleteMovie);
$(document).on("click","#DeleteSchedule", DeleteSchedule);
$(document).on('click',".MovieTable",select_Movie);
$(document).on('click',".scheduleTable",select_Schedule);
$(document).on("click","#AddSchedule", AddDataSchedule);
$(document).on("click","#EditMovieSucc", EditMovieSucc)
$(document).on("click","#AddSchedule1", addScheduleTable);
$(document).on("click","#addAllSchedule",addAllSchedule)
// ----------------------------
frechBranch();
frechTheater();
showmovie();