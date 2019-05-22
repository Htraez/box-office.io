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

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
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
        this.allowSubmit = false;
        this.webState = webState;
        if(this.movie) this.showPoster;

        this.form.find('input').addClass('inactiveStep');
        this.validator = this.form.validate({
            rules: { 
                "seatCode[]": { 
                        required: true, 
                        minlength: 1 
                } 
            }, 
            messages: {
                movieName: {
                    required: "Please select a movie of your choice"
                },
                movieNo: {
                    required: ""
                },
                branchNo:{
                    required: ""
                },
                scheduleNo:{
                    required: "Please select a schedule to continue"
                },
                userEmail:{
                    required: "Please enter your email address"
                },
                userTele:{
                    required: "Your telephone number is needed"
                },
                "seatCode[]": '',
                customerNo:'',
                username:''
            },
            ignore: ".inactiveStep"
        });
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
        
        this.form.find('input').addClass('inactiveStep');
        this.form.find('.form-tab#tab'+(typeof targetStep=='undefined' ? this.step : targetStep)+' input').removeClass('inactiveStep');
        
        this.worker();

        this.validator.resetForm();
        this.form.closest('.popup-window').find('.popup-footer :nth-child(2)').attr("disabled", true);
        this.form.closest('.popup-window').find('.popup-footer :nth-child(1)').off('click').click(()=>{
            console.log('retrograde');
            this.iterate(this.step-1);
            if(this.step > 0) this.form.find('.form-tab#tab'+this.step+' input').val('');
        });
        this.form.closest('.popup-window').find('.popup-footer :nth-child(2)').off('click').click(()=>{
            if(this.form.valid()) {
                this.iterate(this.step+1);
            }
        });

        if(this.step==3){
            this.form.closest('.popup-window').find('.popup-footer :nth-child(2)').hide();
            this.form.closest('.popup-window').find('.popup-footer').append('<button type="submit" class="btn-cornblue submit-btn"><i class="fas fa-cash-register"></i></button>');
            this.allowContinue(this.form, this.form.closest('.popup-window').find('.popup-footer .submit-btn').attr("disabled", true));
            let self = this;
            this.form.closest('.popup-window').find('.popup-footer .submit-btn').off('click').click(function(e){
                if(self.allowSubmit)$('#reservation-form-element')[0].submit();
                //e.preventDefault();
            });
        }else{
            this.form.closest('.popup-window').find('.popup-footer .submit-btn').remove();
            this.form.closest('.popup-window').find('.popup-footer :nth-child(2)').show();
        }
    }

    allowContinue(form, button = undefined){
        if(form.valid()){
            form.closest('.popup-window').find('.popup-footer :nth-child(2)').attr("disabled", false);
            if(button)button.attr("disabled", false);
        }else{
            form.closest('.popup-window').find('.popup-footer :nth-child(2)').attr("disabled", true);
            if(button)button.attr("disabled", true);
        }
    }

    worker(customStep=null){
        this.form.closest('.popup-window').find('.popup-body').css('overflow-y','scroll');
        switch(customStep==null ? this.step:customStep){
            case 0:{
                this.form.closest('.popup-window').find('.popup-body').css('overflow-y','visible');
                break;
            }
            case 1:{
                if(typeof this.webState.temp.branchSelection != 'undefined'){
                    this.form.find('#tab1-branchNo').val(this.webState.temp.branchSelection);
                }
                this.form.closest('.popup-window').find('.popup-footer').children().remove();
                this.form.closest('.popup-window').find('.popup-footer').append('<i class="nav-btn fas fa-arrow-circle-left"></i><i class="nav-btn fas fa-arrow-circle-right"></i>');
                this.showPoster();
                this.form.closest('.popup-area').addClass('row');
                this.form.closest('.popup-window').addClass('plain');
                
                this.form.find('#tab1 #tab1-movieName, #tab3-movieName').text(this.movie.MovieName);
                this.form.find('#tab1 #tab1-movieDesc').text(this.movie.Desc);
                this.form.find('#tab1 #tab1-movieName+span .head-text-badge, #tab3-badge').children().remove();
                this.form.find('#tab1 #tab1-movieName+span .head-text-badge, #tab3-badge').append("<span class='badge'>"+this.movie.Genre+"</span>");
                this.form.find('#tab1 #tab1-movieName+span .head-text-badge, #tab3-badge').append("<span class='badge'>"+this.movie.Rate+"</span>");
                
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
                            origin.allowContinue(origin.form);
                        });
                    });
                });
                break;
            }
            case 2: {
                 
                this.form.find('#tab2-theatreCode').text(this.temp.scheduleSelection.TheatreCode);
                if(typeof this.temp.seatClassForPlan != 'undefined'){
                    let rowNum = 0;
                    
                    let renderarea = this.form.find('#tab2 .seat-renderarea');
                    renderarea.children().remove();
                    renderarea.closest('.popup-window').find('#tab2-class-display').children().remove();
                    renderarea.append('<div class="seat-row"></div>');
                    
                    for(let i=1;i<=this.temp.seatClassForPlan.length;i++){
                        let seatclass = undefined;
                        this.temp.seatClassForPlan.forEach(sc=>{
                            if(sc.ClassName == this.temp.planSelection['SeatClass'+i]){
                                seatclass = sc;
                            }
                        });
                        let nPerRow = Math.floor(this.temp.planSelection.PlanWidth / seatclass.Width);
                        let nRow = this.temp.planSelection['NumberRow'+i];
                        let DOMWidthPercent = 100/nPerRow;
                        let price = seatclass.Price;
                        let isCouple = !!seatclass.Couple;

                        for(let seatNum=0; seatNum<nPerRow*nRow; seatNum++){
                            let seatNumForThisRow = seatNum%(nPerRow)+1;
                            let seatChar = rowNum==0? String.fromCharCode(65 + rowNum%26).repeat(1) : String.fromCharCode(65 + rowNum%26).repeat(Math.ceil(rowNum/rowNum));
                            let seatCode = seatChar+seatNumForThisRow;
                            
                            renderarea.children().last().append('<input type="checkbox" class="seat-dot-checkbox inactiveStep" id="'+seatCode+'" name="seatCode[]" value='+seatCode+' data-seatcode="'+seatCode+'" data-seatprice="'+price+'">');
                            renderarea.children().last().append('<label for="'+seatCode+'" class="seat-dot available '+(isCouple ? 'couple':'')+' class-order-'+i+'" data-seatcode="'+seatCode+'"></label>');
                            
                            if(seatNumForThisRow==nPerRow){
                                rowNum++;
                                renderarea.append('<div class="seat-row"></div>');
                            }
                        }
                        if(this.step==2) renderarea.closest('.popup-window').find('#tab2-class-display').append('<span><label class="seat-dot available '+(isCouple ? 'couple':'')+' class-order-'+i+'"></label> '+seatclass.ClassName+(isCouple ? ' [Couple Seat]':'')+'</br>('+seatclass.Price+' .-)</span>'); 
                    };


                    
                    renderarea[0].scrollLeft = renderarea.children().first().width() / 2 - renderarea.width()/2;
                    if(this.step==2){
                        renderarea.closest('.popup-window').find('#tab2-price-display').children().remove();
                        renderarea.closest('.popup-window').find('#tab2-price-display').append('<div class="level2"><span id="tab2-seat-selection">0</span> Seat(s) Selected</div>');
                        renderarea.closest('.popup-window').find('#tab2-price-display').append('<div class="level2">(Total Price:<span id="tab2-price-selection">0</span> Baht)</div>');
                        
                    }
                    this.temp.seatSelection = 0;
                    this.temp.rawPrice = 0;
                    this.temp.seatList = [];
                    let temp = this.temp;
                    let self = this;
                    renderarea.find('input[type=checkbox].seat-dot-checkbox').change(function(e){
                        let numberTarget = renderarea.closest('.popup-window').find('#tab2-seat-selection');
                        let priceTarget = renderarea.closest('.popup-window').find('#tab2-price-selection');
                        if($(this)[0].checked){
                            numberTarget.text(++temp.seatSelection);
                            temp.rawPrice += parseFloat($(this).data('seatprice'));
                            priceTarget.text(temp.rawPrice);
                            temp.seatList.push({
                                seatCode: $(this).data('seatcode'),
                                fullPrice: $(this).data('seatprice')
                            });
                        }else{
                            numberTarget.text(--temp.seatSelection);
                            temp.rawPrice -= parseFloat($(this).data('seatprice'));
                            priceTarget.text(temp.rawPrice);
                            let newSeatList = [];
                            temp.seatList.forEach((seat)=>{
                                if(seat.seatCode != $(this).data('seatcode')){
                                    newSeatList.push(seat);
                                }
                            });
                            temp.seatList = newSeatList;
                            
                        }
                        self.allowContinue(self.form);
                    });
                    let ticketprocess = this;
                    let enableDrag = false;
                    let dragstartX = 0;
                    let dragstartY = 0;
                    let power = 0.1;
                    renderarea.off('mousedown').mousedown(function(e){
                        if(ticketprocess.step == 2){
                            enableDrag = true; 
                            dragstartX=e.pageX;
                            dragstartY=e.pageY;
                        }
                        e.preventDefault();
                    });
                    renderarea.off('mouseup').mouseup(function(e){
                        enableDrag = false;
                        e.preventDefault();
                    });
                    renderarea.off('mousemove').mousemove(function(e){ 
                        if(typeof enableDrag != 'undefined'){
                            if(enableDrag && ticketprocess.step == 2) {
                                let deltaX=e.pageX - dragstartX; 
                                let deltaY=e.pageY - dragstartY; 
                                $(this)[0].scrollLeft -= (deltaX*power);
                                $(this)[0].scrollTop -= (deltaY*power);
                            }
                        }
                        e.preventDefault();
                    });
                    renderarea.off('mouseleave').mouseleave(function(e){
                        power = 0;
                        e.preventDefault();
                    });
                    renderarea.off('mouseover').mouseover(function(e){
                        power = 0.1;
                        e.preventDefault();
                    });
                }

                if(this.step==2){
                    this.form.find("#tab2 input.inactiveStep").removeClass('inactiveStep');
                }

                break;
            }
            case 3:{
                if(this.webState.isAuth){
                    this.form.find('#tab3-login-widget').hide();
                    this.form.find('#tab3-member-widget').show();
                    this.form.find('#tab3 #ticketing-coupon').attr('disabled', false);
                    this.form.find('#tab3 #tab3-customerNo').val(this.webState.userData.customerNo);
                    this.form.find('#tab3 #tab3-userName').val(this.webState.userData.username);
                    this.allowSubmit = true;
                    this.form.closest('.popup-window').find('.popup-footer .submit-btn').attr('disabled', false);
                }else{
                    iziToast.warning({
                        position: "topCenter", 
                        icon: 'fas fa-exclamation-circle',
                        title: 'Member Only', 
                        message: 'Sorry, please login to book a seat',
                        close: false
                    });
                    this.form.find('#tab3 #tab3-customerNo').val('');
                    this.form.find('#tab3 #tab3-userName').val('');
                    this.form.find('#tab3-login-widget').show();
                    this.form.find('#tab3-member-widget').hide();
                    this.form.find('#tab3 #ticketing-coupon').attr('disabled', true);
                }

                $('#tab3-time-period').text(this.temp.scheduleSelection.Time);
                $('#tab3-branchName').text(this.temp.scheduleSelection.BranchName);
                $('#tab3-theatreCode').text(this.temp.scheduleSelection.TheatreCode);
                $('#tab3-seat-table').find('tr:not(:last-child)').remove();
                this.form.find('#tab3-discount-rate').text('0%');
                this.form.find('#ticketing-coupon').val('');

                let totalPrice = 0;
                this.temp.seatList.forEach((seat)=>{
                    totalPrice += parseFloat(seat.fullPrice);
                    $('#tab3-seat-table').prepend('<tr><td>'+seat.seatCode+'</td><td id="tab3-'+seat.seatCode+'-billing">'+seat.fullPrice+'.-</td></tr>');
                })
                $('#tab3-total-price').text(totalPrice+'.-');
                let self = this;
                let checkToken = false;
                let checkCount = 0;

                this.form.find('#ticketing-coupon').off('input propertychange').on('input propertychange', function(e){
                    if(!checkToken){
                        let usingVal = $(this).val();
                        //loading and prevent submit
                        $(this).addClass('holding-input');
                        self.form.closest('.popup-window').find('.popup-footer .submit-btn').attr("disabled", true);
                        self.allowSubmit = false;

                        setTimeout(()=>{ 
                            if(usingVal != $(this).val() || usingVal == '') return;
                            //use the token and stop altering input
                            checkToken = !checkToken;

                            //coupon validation & application begin
                            fetchData('coupon',{code: $(this).val().toUpperCase()},(data,err)=>{
                                console.log('fetch coupon with code = ', $(this).val());
                                if(!err){
                                    console.log('coupon response=>',data);
                                    if(data.length == 1){
                                        //calculate criteria result
                                        let datePass = new Date() > new Date(data[0].EXPDate) ? false:true;
                                        let minSeatPass = self.temp.seatList.length >= data[0].MinSeat ? true:false;
                                        let totalSpend = 0;
                                        self.temp.seatList.forEach((seat)=>{totalSpend += seat.fullPrice});
                                        let spendPass = totalSpend >= data[0].MinSpend ? true:false;
                                        let availablePass = data[0].NoAvailable > 0 ? true:false;
                                        //check all criteria are passed
                                        if(datePass && minSeatPass && spendPass && availablePass){
                                            //calculate discount
                                            let discountPercent = data[0].Discount*100;
                                            let discountPrice = totalSpend*(1-data[0].Discount);
                                            
                                            //confirm on screen
                                            iziToast.show({
                                                title: '&#128537; Hooray! ',
                                                message: 'Coupon "'+data[0].CouponCode+'" Applied',
                                                position: 'topCenter',
                                                color: 'green',
                                                close: false
                                            });
                                            
                                            //apply discount (just show to screen)
                                            self.form.find('#tab3-discount-rate').text(discountPercent.toString(10)+'%');
                                            self.form.find('#tab3-total-price').text(discountPrice.toString(10)+'.-');
                                        }else{
                                            iziToast.show({
                                                title: '&#128549; Coupon Not Applied',
                                                message: 'Coupon Requirement Not Met\t',
                                                position: 'topCenter',
                                                color: 'red',
                                                close: false
                                            });
                                            let totalSpend = 0;
                                            self.temp.seatList.forEach((seat)=>{totalSpend += seat.fullPrice});
                                            self.form.find('#tab3-discount-rate').text('0%');
                                            self.form.find('#tab3-total-price').text(totalSpend.toString(10)+'.-');
                                            $(this).val('');
                                        }
                                    }else{
                                        //prompt not found toast
                                        iziToast.show({
                                            title: '&#128551; Oops!',
                                            message: 'Coupon "'+$(this).val().toUpperCase()+'" Not Found...\t',
                                            position: 'topCenter',
                                            color: 'red',
                                            close: false
                                        });
                                        //revert to original price
                                        let totalSpend = 0;
                                        self.temp.seatList.forEach((seat)=>{totalSpend += seat.fullPrice});
                                        self.form.find('#tab3-discount-rate').text('0%');
                                        self.form.find('#tab3-total-price').text(totalSpend.toString(10)+'.-');
                                        $(this).val('');
                                    }
                                }else{
                                    console.log(err);
                                }
                                //release the token
                                checkToken = !checkToken;
                                $(this).removeClass('holding-input');
                                //allow form submit after coupon application has concluded
                                self.allowSubmit = true;
                                self.allowContinue(self.form, self.form.closest('.popup-window').find('.popup-footer .submit-btn'));
                            }); 
                        }, 3000);
                        
                    }
                });
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
                iziToast.destroy();
            }else{
                console.log(err);
            }
        }); 
    }

    setHoldingSchedule = (schedule) =>{
        this.schedule = schedule;
    }

    updateUIByAuth = () => {
        if(this.isAuth) {
            $('#head-login-btn').hide();
            $('#head-user-badge').show();
            if(this.role==='admin'){
                $('#toAdmin-btn').show();
            }
            console.log(this.userData);
            let middleName = '';
            if(this.userData.MidName!=null) middleName = this.userData.MidName;
            let fullName = this.userData.FirstName.capitalize()
                            +' '+ middleName.capitalize()
                            +' '+ this.userData.LastName.capitalize();
            $('.fetch.userFullName').text(fullName);
            $('.fetch.userEmail').text(this.userData.Email);
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