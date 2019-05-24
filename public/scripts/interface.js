let nowShowing = undefined;
let webState = undefined;
$(document).ready(function(){
    webState = new webstate(auth);
    if(typeof data != 'undefined'){
        if(typeof data.reservationSuccess != 'undefined'&&typeof data.reservationSuccess.reservationNo != 'undefined'&&typeof data.reservationSuccess.scheduleNo != 'undefined'){
            webState.temp.focusReservation = data.reservationSuccess;
            
            //get openlist element
            let datebookList = $('#user-ticket-datebook');
            let scheduleList = $('#user-ticket-schedule');
            let bookList = $('#user-ticket-reservation');
            let infoList = $('#user-ticket-detail');
            
            var toast = document.querySelector('.fetchToast'); // Selector of your toast
            iziToast.hide({}, toast);
            
            iziToast.show({
                title: 'Success! ',
                class: 'ticketSuccess',
                icon: 'fas fa-calendar-check',
                message: 'Ticket Reservation Success! Loading Your Ticket Info.',
                position: 'topCenter',
                color: 'green',
                overlay: true,
                timeout: false,
                close: false
            });

            $(document).on('fetchReservationComplete', function(){
                //close toast
                var toast = document.querySelector('.ticketSuccess'); // Selector of your toast
                iziToast.hide({}, toast);
                //show my reservation by focus at the reservationNo
                $('.web-body').removeClass('overlay');
                $('#user-ticket').trigger('init').show();
                //focusing
                let bookdateOfTarget = bookList.find('li[data-reservation-no="'+webState.temp.focusReservation.reservationNo+'"]').data('bookDate');
                datebookList.find('li[data-book-date="'+bookdateOfTarget+'"]').trigger('focusReservation');
                scheduleList.find('li[data-schedule-no="'+webState.temp.focusReservation.scheduleNo+'"]').trigger('focusReservation');
                bookList.find('li[data-reservation-no="'+webState.temp.focusReservation.reservationNo+'"]').trigger('focusReservation');
                
                //show prompt
                iziToast.show({
                    title: 'Cha-ching!~ ',
                    class: 'ticketSuccess',
                    icon: 'fas fa-ticket-alt',
                    message: 'This Is Your Ticket',
                    position: 'topCenter',
                    color: 'green',
                    displayMode: 1,
                    timeout: 10000,
                    close: false
                });

                $(document).off('fetchReservationComplete');
            });
            
        }
    }
});

$(document).on("keydown", "form.preventEnter", function(event) { 
    return event.key != "Enter";
    //prevent hitting enter in form
});

$('.popup-area, #popup-close, .close-key').click(function(e){
    if(e.target != this && e.target != this.children[0]) return;
    $('.web-body').removeClass('overlay');
    $(this).closest('.popup-area').hide();
});

$('.web-body').on('popup-closeAll', function(){
    $('.web-body').removeClass('overlay');
    $('.popup-area').hide();
});

$('button, .side-bar-icon, a').click(function(){
    let popupId = $(this).data('popup');
    if(popupId){
        if(popupId=='buy-ticket-popup'&&webState.role == 'admin'){
            iziToast.show({
                position: "topCenter", 
                icon: 'fas fa-ban',
                title: 'Prohibited!', 
                color: 'yellow',
                message: 'Admin can\'t book a seat',
                close: false
            });
            return;
        }
        $('.web-body').addClass('overlay');
        $('#'+popupId).trigger('init').show();
    }
})

$('.logo').dblclick(function(){
    $('.content-box').toggleClass('special-mode');
});

$('button').on('reset', function(e, isDisable=true, moreClass=undefined){
    if($(this).data('default-disable')&&isDisable) $(this).prop("disabled", true);
    if(typeof $(this).data('default-class') != 'undefined'||moreClass) $(this).attr( "class", $(this).data('default-class')+' '+(moreClass?moreClass:''));
    if(typeof $(this).data('default-txt') != 'undefined') $(this).find('span').text($(this).data('default-txt'));
});