const fetchData = (topic, data, next) => {
    switch(topic){
        case 'user':{
            $.get('/user', {
                columns:data
            },(data)=>{
                next(data,null);
            }).fail((err)=>{
                next(null,err);
            });
            break;
        }
        default: {
            $.get('/'+topic,data, (dataBack)=>{
                next(dataBack,null);
            }).fail((err)=>{
                next(null,err);
            });
            break;
        }
    }
}

class ticketingProcess {
    constructor(formElem, scheduleArray=undefined, movieObj=undefined, auth=false, webState, step=0){
        this.step = step;
        this.movie = movieObj;
        this.schedules = scheduleArray;
        this.selectSchedule = undefined;
        this.isGuest = auth;
        this.form = formElem; //Jquery Element Only
        this.temp={};
        this.webState = webState;
        if(this.movie) this.showPoster;
    }

    showPoster(){
        if(this.isShownPoster) return;
        let data = {
            data: this.movie,
            mode: 'popup-row'
        };
        let posterHtml = new EJS({url:'/client-templates/movie-poster'}).render(data);
        this.form.closest('.popup-area').prepend(posterHtml);
        this.isShownPoster = true;
    }

    iterate(targetStep=undefined){
        console.log('iterate', this.step, targetStep);
        if(typeof targetStep!='undefined'){
            this.step = targetStep;
            if(targetStep==0) this.kill();
        }
        this.form.find('.form-tab').addClass('hide');
        this.form.find('.form-tab#tab'+(typeof targetStep=='undefined' ? ++this.step : targetStep)).removeClass('hide');
        this.worker();
        
        this.form.closest('.popup-window').find('.popup-footer :nth-child(1)').off('click').click(()=>{this.iterate(this.step-1)});
        this.form.closest('.popup-window').find('.popup-footer :nth-child(2)').off('click').click(()=>{this.iterate(this.step+1)});
    }

    worker(customStep=null){
        switch(customStep==null ? this.step:customStep){
            case 1:{
                this.form.closest('.popup-window').find('.popup-footer').children().remove();
                this.form.closest('.popup-window').find('.popup-footer').append('<i class="nav-btn fas fa-arrow-circle-left"></i><i class="nav-btn fas fa-arrow-circle-right"></i>');
                this.showPoster();
                this.form.closest('.popup-area').addClass('row');
                this.form.closest('.popup-window').addClass('col-8 plain');
                
                this.form.find('#tab1 #tab1-movieName').text(this.movie.MovieName);
                this.form.find('#tab1 #tab1-movieDesc').text(this.movie.Desc);
                this.form.find('#tab1 #tab1-movieName+span .head-text-badge').children().remove();
                this.form.find('#tab1 #tab1-movieName+span .head-text-badge').append("<span class='badge'>"+this.movie.Genre+"</span>");
                this.form.find('#tab1 #tab1-movieName+span .head-text-badge').append("<span class='badge'>"+this.movie.Rate+"</span>");
                
                this.temp.branchSchedule = {}
                this.schedules.forEach((schedule) => {
                    if(typeof this.temp.branchSchedule[schedule.BranchName] == 'undefined') this.temp.branchSchedule[schedule.BranchName] = [];
                    this.temp.branchSchedule[schedule.BranchName].push(schedule);
                });

                this.form.find('#tab1 #tab1-branch-list').children().remove();
                this.form.find('#tab1 #tab1-schedule-list').children().remove();
                Object.keys(this.temp.branchSchedule).forEach((branchName)=>{
                    this.form.find('#tab1 #tab1-branch-list').append('<li data-branch="'+branchName+'">'+branchName+'</li>');
                    let form = this.form;
                    let ws = this.webState;
                    this.form.find('#tab1 #tab1-branch-list').children().last().click(function(e){
                        $(this).addClass('selected');
                        $(this).siblings().removeClass('selected');
                        form.find('#tab1 #tab1-schedule-list li').hide();
                        form.find('#tab1 #tab1-schedule-list li[data-branch="'+$(this).data('branch')+'"]').show();
                    });
                    this.temp.branchSchedule[branchName].forEach((schedule)=>{
                        this.form.find('#tab1 #tab1-schedule-list').append('<li data-branch="'+branchName+'">'+schedule.Time+'<span class="badge" style="margin-left: 1rem;">'+schedule.Dimension+'</span></li>');
                        if(this.webState.temp.branchSelection.name != branchName){this.form.find('#tab1 #tab1-schedule-list').children().last().hide();}
                        else this.form.find('#tab1 #tab1-branch-list').children().last().addClass('selected');
                        let origin = this;
                        this.form.find('#tab1 #tab1-schedule-list').children().last().click(function(){
                            form.find('#tab1-branchNo').val(schedule.BranchNo);
                            form.find('#tab1-scheduleNo').val(schedule.ScheduleNo);
                            $('#buy-ticket-popup').trigger('get-theatre-plan', [schedule]);
                            origin.temp.scheduleSelection = schedule;
                            $(this).addClass('selected');
                            $(this).siblings().removeClass('selected');
                        });
                    });
                });
                break;
            }
            case 2: {
                this.form.find('#tab2-theatreCode').text(this.temp.scheduleSelection.TheatreCode);
                if(typeof this.temp.seatClassForPlan != 'undefined'){
                    let i = 1;
                    let rowNum = 0;
                    this.temp.seatClassForPlan.forEach(seatclass => {
                        let nPerRow = Math.floor(this.temp.planSelection.PlanWidth / seatclass.Width);
                        let nRow = this.temp.planSelection['NumberRow'+i];
                        let DOMWidthPercent = 100/nPerRow;
                        let price = seatclass.Price;
                        let isCouple = !!seatclass.Couple;

                        $('#tab-2-seat-class-'+i).children().remove();
                        $('#tab-2-seat-class-'+i).append('<div class="tab2-seat-row"></div>');
                        for(let seatNum=0; seatNum<nPerRow*nRow; seatNum++){
                            let seatNumForThisRow = seatNum%(nPerRow)+1;
                            let seatChar = rowNum==0? String.fromCharCode(65 + rowNum%26).repeat(1) : String.fromCharCode(65 + rowNum%26).repeat(Math.ceil(rowNum/rowNum));
                            $('#tab-2-seat-class-'+i).children().last().append('<div class="seat-dot available" data-seat-code="'+seatChar+seatNumForThisRow+'"></div>');
                            if(seatNumForThisRow==nPerRow){
                                rowNum++;
                                $('#tab-2-seat-class-'+i).append('<div class="tab2-seat-row"></div>');
                            }
                        }
                        i++;
                    });
                }
                break;
            }
        }
    }

    kill(){
        console.log('kill');
        this.step = 0;
        this.isShownPoster = false;
        this.form.closest('.popup-area').find('.floating').remove();
        this.form.closest('.popup-window').find('.popup-footer').children().remove();
        this.form.closest('.popup-area').removeClass('row');
        this.form.closest('.popup-window').removeClass('col-8 plain');
    }
}

class webstate{
    constructor(auth){
        this.isAuth = auth;
        this.role = this.isAuth ? uRole:undefined;
        this.temp = {};
        if(typeof this.role!='undefined') this.role = this.role == 2 ? 'admin':'user';
        if(this.isAuth) {
            fetchData('user',['*'], (data,err)=>{
                if(!err){
                    this.userData = data;
                    this.updateUIByAuth();
                }
            });
        }
        fetchData('movies',{status: 'show'},(data,err)=>{
            if(!err){
                this.showingList = data;
                this.renderMoviesGrid($('.program-row'), 'index-row');
                this.renderMoviesGrid($('.reserv-render-area'));
            }else{
                console.log(err);
            }
        }); 
    }

    setHoldingSchedule = (schedule) =>{
        this.schedule = schedule;
    }

    updateUIByAuth=()=>{
        if(this.isAuth) {
            $('#head-login-btn').hide();
            $('#head-user-badge').show();
            if(this.role==='admin'){
                $('#toAdmin-btn').show();
            }
            $('.fetch.username').text(this.userData.username);
            $('.fetch.userpic').attr('src',this.userData.ImageURL);
        };
    }

    renderMoviesGrid = (targetRow=null, mode=undefined) => {
        let i = 0;
        this.showingList.forEach(movie => {
            targetRow.empty();
            let data = {
                data: movie, 
                onclick: 'selectMovie('+ i + (mode=='index-row'?',this':'') + ")",
                mode: mode};
            let html = new EJS({url:'/client-templates/movie-poster'}).render(data);
            if(targetRow!=null) targetRow.append(html);
            i++;
        });
        $('.nshowing').text(targetRow.children().length);
    }
    
    renderList = (listData, target=null) => {
        listData.forEach(list => {
            target.empty();
            target.find('.list').append('<li></li>')
        })
    }

}


class ScheduleProcess{
    constructor(){
        // ตัวแปรเก็บ + (operationดึง+onclick)
        fetchData("movies",{MovieNo})
        fetchData("branch",{BranchNo})
        fetchData("theatre",{TheatreCode})
    }
    // function อื่นๆ เรียก ondemand
}
