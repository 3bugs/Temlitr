var myApp = new Framework7({
    cacheDuration: 0
});

var $$ = Dom7;

var mainView = myApp.addView('.view-main', {
    dynamicNavbar: true
});

var QUERY = '';

$$(document).on('deviceready', function () {
    setTimeout(function () {
        mainView.router.load({
            url: 'near.html',
            ignoreCache: true
        });
    }, 3000);

    $$('.navbar').hide();

    $$(".page").addClass("bg_home");
    // $$(".navbar").addClass( "nav_main" );
    var hei = $$(window).height();
    $$('.prel').css({height: hei + 'px'});

});

myApp.onPageInit('index', function (page) {

    $$('.navbar').hide();

    $$(".page").addClass("bg_home");
    $$(".navbar").addClass("nav_main");
});

myApp.onPageInit('near', function (page) {
    preshow();
    $$(".page").addClass("bg_near");
    $$(".navbar").addClass("nav_main");
    $$('.navbar').show();

    var hei = $$(window).height();
    $$('#map-canvas').css({height: hei + 'px'});

    var sess = window.localStorage.getItem('access_token');

    if (sess == null || sess == '') {
        $$('#m_profile').hide();
        $$('.m_logout').hide();
    }
    var map = new google.maps.Map(document.getElementById('map-canvas'), {
        zoom: 6,
        center: {lat: 15.8700, lng: 100.9925}
    });
    var uuid = device.uuid;
    var url = 'http://203.148.172.106/api/stations/search/nearly';
    $$.ajax({
        type: "GET",
        dataType: "json",
        asyc: false,
        url: url + '?latitude=' + 15.8700 + '&longitude=' + 100.9925 + '&radius=1000&uuid=' + uuid,
        headers: {"Accept": "application/json"},
        success: function (data) {
            var locations = new Array();
            var markers = new Array();
            $$.each(data, function (i, item) {
                var oilname = data[i].name;
                var tel = data[i].tel;
                var id = data[i].id;
                var distance = data[i].distance;

                locations.push({lat: data[i].latitude, lng: data[i].longitude});
                if (data[i].standard_id == 1) {
                    marker = new google.maps.Marker({
                        position: {lat: data[i].latitude, lng: data[i].longitude},
                        map: map,
                        icon: "http://203.148.172.106/pin/blue.png",
                        title: data[i].name
                    });
                    attachSecretMessage(marker, data[i].name, data[i].latitude, data[i].longitude);
                    markers.push(marker);

                } else {
                    marker = new google.maps.Marker({
                        position: {lat: data[i].latitude, lng: data[i].longitude},
                        map: map,
                        icon: "http://203.148.172.106/pin/red.png",
                        title: data[i].name
                    });
                    markers.push(marker);
                    attachSecretMessage(marker, data[i].name, data[i].latitude, data[i].longitude);
                }
            });
            var markerCluster = new MarkerClusterer(map, markers,
                {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
            prehide();
        }, failure: function (err) {
            prehide();
            myApp.alert(err.message, 'error');
        }
    });
});

myApp.onPageInit('nearby', function (page) {
    preshow();
    $$(".page").addClass("bg_near");
    $$(".navbar").addClass("nav_main");

    var hei = $$(window).height();
    $$('#map-canvas-nb').css({height: hei + 'px'});

    getLocationnearby();
});

myApp.onPageInit('nearlist', function (page) {
    preshow();
    $$(".navbar").show();
    $$(".page").addClass("bg_nearlist");
    $$(".navbar").addClass("nav_main");

    getLocationnearlist();
});

myApp.onPageInit('near_detail', function (page) {
    preshow();

    $$(".page").addClass("bg_near_detail");
    $$(".navbar").addClass("nav_main");


    $$('#c_message').on('focus', function () {
        $$(this).val('');
    });

    let data = page.query;

    let id = data.id;
    let latitude = data.latitude;
    let longitude = data.longitude;

    loadDetail(id, latitude, longitude);

    $$('.detail_form_button').on('click', function () {
        var detail_id = localStorage.getItem("detail_id");
        var url = 'http://203.148.172.106/api/stations/' + id + '/comments';
        var mes = $$('#c_message').val();
        var uuid = device.uuid;

        var data = {"comment": mes, "uuid": uuid};

        myStorage = window.localStorage;
        var access_token = myStorage.getItem('access_token');

        $$.ajax({
            type: "POST",
            dataType: "json",
            url: url,
            headers: {"Accept": "application/json", "Authorization": access_token},
            data: data,
            success: function (response) {
                if (response.data.id != "") {
                    myApp.alert('ส่ง comment เรียบร้อย', 'น้ำมันเต็มลิตร');
                    $$('#c_message').val('');
                } else {
                    myApp.alert('โปรดลองอีกครั้ง', 'น้ำมันเต็มลิตร');
                }
            }
        });
    });
});

myApp.onPageInit('contact', function (page) {
    prehide();
    $$(".navbar").show();
    $$(".page").addClass("bg_contact");
    $$(".navbar").addClass("nav_main");

    $$('.contact_form_button').on('click', function () {

        var url = 'http://203.148.172.106/api/contactuses';
        var titl = $$('#c_title').val();
        var tel = $$('#c_tel').val();
        var mes = $$('#c_message').val();
        var name = $$('#c_name').val();
        var uuid = device.uuid;

        var data = {"title": titl, "message": mes, "uuid": uuid, "name": name, "tel": tel};

        myStorage = window.localStorage;
        var access_token = myStorage.getItem('access_token');

        if (titl == '' || mes == '' || name == '' || tel == '') {
            myApp.alert('กรุณากรอกข้อมูลให้ครบค่ะ', 'น้ำมันเต็มลิตร');
            return false;
        }

        $$.ajax({
            type: "POST",
            dataType: "json",
            url: url,
            headers: {"Accept": "application/json", "Authorization": access_token},
            data: data,
            success: function (response) {
                console.log('response is : ' + response.data.id);
                if (response.data.id != "") {
                    myApp.alert('ส่งข้อมูลติดต่อเรียบร้อย', 'น้ำมันเต็มลิตร');

                } else {
                    myApp.alert('โปรดลองอีกครั้ง', 'น้ำมันเต็มลิตร');
                }
            }
        });
    });

    getOrganizationLocation();
});

myApp.onPageInit('search', function (page) {
    $$('.navbar').show();
    $$(".page").addClass("bg_search");
    $$(".navbar").addClass("nav_main");

    buildBrands();
    buildOilType();
    buildPumpType();
    buildStandard();
    buildAtms();
    var uuid = device.uuid;
    $$('#text_search').on('input', function () {
        event.preventDefault();
        var textsearch = $$('#text_search').val();
        var uuid = device.uuid;

        var urlsearch = 'http://203.148.172.106/api/stations/search/auto?q=' + encodeURIComponent(textsearch) + '&uuid=' + uuid;

        let access_token = localStorage.getItem("access_token");

        if ($$('#hide_s').val() == 'on') {
            $$('.ul_dearch').html('');
        }


        $$.ajax({
            type: "GET",
            dataType: "json",
            url: urlsearch,
            headers: {"Authorization": access_token, "Accept": "application/json"},
            contentType: "charset=utf-8",
            success: function (data) {
                $$('#list_auto_s').html('');
                $$.each(data, function (i, item) {
                    var name = data[i].name;
                    $$('#list_auto_s').append('<div id="' + data[i].name + '" class="row t_detail" >' + name + '</div>');


                });

                $$('.t_detail').on('click', function () {
                    var s_name = $$(this).attr('id');
                    $$('#text_search').val(s_name);
                    $$('#list_auto_s').html('');
                });
            },
            error: function (err) {
                if (err.status == 422) {
                    myApp.alert(message['message'], 'error');
                } else {
                    myApp.alert(err.responseText, 'error');
                }
            }
        });
    });
    $$('.search_form_button').on('click', goToSearchResult);
    $$('input[name="q"]').on('keydown', function (e) {

        if (e.keyCode == 13) {
            event.preventDefault();
            goToSearchResult();
        }
    });
});

myApp.onPageInit('history1', function (page) {
    $$(".page").addClass("bg_history");
    $$(".navbar").addClass("nav_main");

    $$('.b_post').on('click', function () {
        mainView.router.load({
            url: 'history2.html',
            ignoreCache: true
        });
    });
    $$('.b_history').on('click', function () {
        mainView.router.load({
            url: 'history3.html',
            ignoreCache: true
        });
    });
    getHistory(1);

});

myApp.onPageInit('history2', function (page) {
    $$(".page").addClass("bg_history");
    $$(".navbar").addClass("nav_main");

    $$('.b_discussion').on('click', function () {
        mainView.router.load({
            url: 'history.html',
            ignoreCache: true
        });
    });
    $$('.b_history').on('click', function () {
        mainView.router.load({
            url: 'history3.html',
            ignoreCache: true
        });
    });
    getHistory(2);

});

myApp.onPageInit('history3', function (page) {

    $$(".page").addClass("bg_history");
    $$(".navbar").addClass("nav_main");

    $$('.b_discussion').on('click', function () {
        mainView.router.load({
            url: 'history.html',
            ignoreCache: true
        });
    });
    $$('.b_post').on('click', function () {
        mainView.router.load({
            url: 'history2.html',
            ignoreCache: true
        });
    });
    getHistory(3);
});

myApp.onPageInit('search_result', function (page) {
    let query = page.query;
    var hei = $$(window).height();
    $$(".page").addClass("bg_search_result");
    $$(".navbar").addClass("nav_main");

    $$('#list-block').css({minHeight: hei + "px"});
    QUERY = '';
    $$.each(query, function (i, item) {
        QUERY += i + '=' + query[i] + '&';
    });
    getLocationsearch();
});

function goToSearchResult() {
    let formData = myApp.formToJSON('#layout_searchform');
    let params = '';
    if (formData.q !== null && formData.q !== undefined && formData.q !== '') {
        params += 'q=' + encodeURIComponent(formData.q);
    }
    if (formData.brand_id !== null && formData.brand_id !== undefined && formData.brand_id !== '') {
        params += 'brand_id=' + formData.brand_id;
    }
    if (formData.pump_type_id !== null && formData.pump_type_id !== undefined && formData.pump_type_id !== '') {
        params += '&pump_type_id=' + formData.pump_type_id;
    }
    if (formData.types !== null && formData.types !== undefined && formData.types !== '') {
        params += '&types=' + formData.types.join();
    }
    if (formData.standard_id !== null && formData.standard_id !== undefined && formData.standard_id !== '') {
        params += '&standard_id=' + formData.standard_id;
    }
    if (formData.atms !== null && formData.atms !== undefined && formData.atms !== '') {
        params += '&atms=' + formData.atms;
    }
    if (params.indexOf('&') == 0) {
        params = params.substr(1, params.length);
    }
    mainView.router.load({
        url: 'search_result.html?' + params,
        ignoreCache: true
    });
}

function loadDetail(id, latitude, longitude) {

    $$('#navi_icon').on('click', function () {
        var addressLongLat = latitude + ',' + long;
        window.open("http://maps.google.com/?q=" + addressLongLat, '_system');
    });

    var detail_id = localStorage.getItem("detail_id");

    let access_token = localStorage.getItem("access_token");

    var uuid = device.uuid;
    let url = 'http://203.148.172.106/api/stations/' + id + '?uuid=' + uuid + '&latitude=' + latitude + '&longitude=' + longitude;

    $$.ajax({
        type: "GET",
        dataType: "json",
        asyc: false,
        url: url,
        headers: {"Accept": "application/json"},
        success: function (response) {
            $$('.bg_near_detail').css('background-image', 'url(' + response.data['picture'] + ')');
            $$('#n_detail_name').html(response.data['name']);
            $$.each(response.data['pictures'], function (i, item) {
                $$('#pic_station').append('<div class="col-25"><img src="' + response.data['pictures'][i]['profile'] + '" width="100%" style="margin-bottom:2px;margin-top:2px;"></div>');
            });
            for (let i = 0; i < 4 - response.data['pictures'].length; i++) {
                $$('#pic_station').append('<div class="col-25"></div>');
            }
            $$('.tel').html(response.data['tel']);
            $$('.viewer').html(response.data['viewer']);
            $$('.detail').html(response.data['description']);
            $$('#distance').html('<span class="distance_text">' + response.data['distance'] + '&nbsp;km. </span>');

            $$('#navi_icon').on('click', function () {
                var addressLongLat = response.data['latitude'] + ',' + response.data['longitude'];
                window.open("http://maps.google.com/?q=" + addressLongLat, '_system');
            });

            $$.each(response.data['oil_types'], function (i, item) {
                $$('#oil_types').append('<div class="col-25"><img src="' + response.data['oil_types'][i].profile + '" width="100%" ></div>');
            });
            for (let i = 0; i < 4 - response.data['oil_types'].length; i++) {
                $$('#oil_types').append('<div class="col-25"></div>');
            }

            $$.each(response.data['stores'], function (i, item) {
                $$('#shop_list').append('<div class="col-25"><img src="' + response.data['stores'][i].profile + '" width="100%" ></div>');
            });
            for (let i = 0; i < 4 - response.data['stores'].length; i++) {
                $$('#shop_list').append('<div class="col-25"></div>');
            }

            $$.each(response.data['atms'], function (i, item) {
                $$('#atms_list').append('<div class="col-25"><img src="' + response.data['atms'][i].profile + '" width="100%" ></div>');
            });
            for (let i = 0; i < 4 - response.data['atms'].length; i++) {
                $$('#atms_list').append('<div class="col-25"></div>');
            }
        },
        error: function (err) {
            if (err.status == 422) {
                myApp.alert(message['message'], 'error');
            }
        }
    });
}

function preloader(timeout) {

    var hei = $$(window).height();
    $$('.prel').css({height: hei + 'px'});

    setTimeout(function () {
        $$('.preloader').hide();
        $$('.prel').hide();
    }, timeout);
}

function preshow() {
    var hei = $$(window).height();
    $$('.prel').css({height: hei + 'px'});
}

function prehide() {
    $$('.preloader').hide();
    $$('.prel').hide();
}

var options = {enableHighAccuracy: true};

function getLocationnearby() {
    checkPermissions(
        function () {
            let watchID = navigator.geolocation.getCurrentPosition(successnearby, failure, options);
            navigator.geolocation.clearWatch(watchID);
        }
    );
}

function getLocationnearlist() {
    checkPermissions(
        function () {
            let watchID = navigator.geolocation.getCurrentPosition(successnearlist, failure, options);
            navigator.geolocation.clearWatch(watchID);
        }
    );
}

function getLocationsearch() {
    checkPermissions(
        function () {
            let watchID = navigator.geolocation.getCurrentPosition(successsearch, failure, options);
            navigator.geolocation.clearWatch(watchID);
        }
    );
}

function getOrganizationLocation() {
    checkPermissions(
        function () {
            let watchID = navigator.geolocation.getCurrentPosition(successorganization, failure, options);
            navigator.geolocation.clearWatch(watchID);
        }
    );
}

function successorganization(position) {
    var latitude = position.coords.latitude;
    var long = position.coords.longitude;

    let url = 'http://203.148.172.106/api/distances?latitude1=' + latitude + '&longitude1=' + long + '&latitude2=13.5949785&longitude2=100.5810723';

    $$.ajax({
        type: "GET",
        dataType: "json",
        asyc: false,
        url: url,
        //headers:{"Authorization": access_token, "Accept":"application/json"},
        headers: {"Accept": "application/json"},
        /*data: stationData,*/
        success: function (response) {
            var distance = response.data.toFixed(2);
            $$('.organize_location').html(distance + '&nbsp;');
        }

    });

}

function successsearch(position) {
    var latitude = position.coords.latitude;
    var long = position.coords.longitude;
    var uuid = device.uuid;
    let _url = 'http://203.148.172.106/api/stations/search/autocomplete?' + QUERY + '&latitude=' + latitude + '&longitude=' + long + '&radius=10&uuid=' + uuid;
    let html = '';
    $$.ajax({
        type: "GET",
        dataType: "json",
        url: _url,
        asyc: false,
        success: function (data) {
            if (data == '') {
                myApp.alert('ไม่พบผลลัพธ์จากการค้นหา', 'น้ำมันเต็มลิตร');
                prehide();
            } else {
                $$.each(data, function (i, item) {
                    var oilname = data[i].name;
                    var tel = data[i].tel == '' ? ' - ' : data[i].tel;
                    var id = data[i].id;
                    var distance = data[i].distance;
                    var detail = data[i].description;

                    var stationname = '';
                    var detail_station = '';
                    if (oilname.lenght <= 22 && detail <= 100) {
                        stationname = oilname;
                        detail_station = detail;
                    } else {
                        stationname = oilname.substring(0, 20) + '...';
                        detail_station = detail.substring(0, 100) + '...';
                    }
                    html += '<div id="' + data[i].id + '" class="row t_detail">\
                                <div class="col-33 img_list">\
                                    <img src="' + data[i].profile + '" width="120%" style="border-radius: 4px;">\
                                    <span class="distance_text">' + distance + '</span><span>km.</span>\
                                </div>\
                                <div class="col-66 detail_list">\
                                    <img src="img/pin_icon.jpg" width="10%">&nbsp;&nbsp;<span>' + stationname + '</span><br>\
                                    <img src="img/phone_icon.jpg" width="10%">&nbsp;&nbsp;<span>' + tel + '</span><br>\
                                    <span class="detail_nearlist">' + detail_station + '</span>\
                                </div>\
                                </div>';
                });

                $$('#list-block').html(html);
                prehide();
                $$('.t_detail').on('click', function () {
                    var id = $$(this).attr('id');
                    mainView.router.load({
                        url: 'near_detail.html?id=' + id + '&latitude=' + latitude + '&longitude=' + long,
                        ignoreCache: true
                    });
                });
            }
        },
        error: function (xhr, status) {
            myApp.alert(status, 'error');
            prehide();
        }
    });
}

function successnearlist(position) {
    var latitude = position.coords.latitude;
    var long = position.coords.longitude;

    var uuid = device.uuid;

    var url = 'http://203.148.172.106/api/stations/search/nearly';
    var access_token = localStorage.getItem("access_token");

    let html = '';
    $$.ajax({
        type: "GET",
        dataType: "json",
        url: url + '?latitude=' + latitude + '&longitude=' + long + '&radius=10&uuid=' + uuid,
        headers: {"Authorization": access_token, "Accept": "application/json"},
        success: function (data) {
            $$.each(data, function (i, item) {
                var oilname = data[i].name;
                var tel = data[i].tel == '' ? ' - ' : data[i].tel;
                var id = data[i].id;
                var distance = data[i].distance;
                var detail = data[i].description;

                var stationname = '';
                var detail_station = '';
                if (oilname.lenght <= 22 && detail <= 100) {
                    stationname = oilname;
                    detail_station = detail;
                } else {
                    stationname = oilname.substring(0, 20) + '...';
                    detail_station = detail.substring(0, 100) + '...';
                }
                html += '<div id="' + data[i].id + '" class="row t_detail">\
                            <div class="col-33 img_list">\
                                <img src="' + data[i].profile + '" width="120%" style="border-radius: 4px;">\
                                <span class="distance_text">' + distance + '</span><span>km.</span>\
                            </div>\
                            <div class="col-66 detail_list">\
                                <img src="img/pin_icon.jpg" width="10%">&nbsp;&nbsp;<span>' + stationname + '</span><br>\
                                <img src="img/phone_icon.jpg" width="10%">&nbsp;&nbsp;<span>' + tel + '</span><br>\
                                <span class="detail_nearlist">' + detail_station + '</span>\
                            </div>\
                        </div>';
            });

            $$('#list-block').html(html);

            $$('.t_detail').on('click', function () {
                var id = $$(this).attr('id');
                mainView.router.load({
                    url: 'near_detail.html?id=' + id + '&latitude=' + latitude + '&longitude=' + long,
                    ignoreCache: true
                });
            });

        }, failure: function (err) {
            myApp.alert(err.message, 'error');
        }

    });
    prehide();
}

function successnearby(position) {
    var latitude = position.coords.latitude;
    var long = position.coords.longitude;
    var uuid = device.uuid;

    var mapOptions = {
        center: {lat: latitude, lng: long},
        zoom: 12
    };

    var map = new google.maps.Map(document.getElementById('map-canvas-nb'), mapOptions);
    var url = 'http://203.148.172.106/api/stations/search/nearly';

    var access_token = localStorage.getItem("access_token");

    let marker = new google.maps.Marker({
        position: {lat: latitude, lng: long},
        map: map,
        icon: "http://203.148.172.106/pin/current.png",
        title: "My Location"
    });

    var contentString = "My Location";
    attachSecretMessage(marker, contentString);

    $$.ajax({
        type: "GET",
        dataType: "json",
        url: url + '?latitude=' + latitude + '&longitude=' + long + '&radius=5&uuid=' + uuid,
        headers: {"Authorization": access_token, "Accept": "application/json"},
        success: function (data) {
            $$.each(data, function (i, item) {
                var oilname = data[i].name;
                var tel = data[i].tel;
                var id = data[i].id;
                var distance = data[i].distance;
                if (data[i].standard_id == 1) {
                    marker = new google.maps.Marker({
                        position: {lat: data[i].latitude, lng: data[i].longitude},
                        map: map,
                        icon: "http://203.148.172.106/pin/blue.png",
                        title: data[i].name
                    });
                    attachSecretMessage(marker, data[i].name, data[i].latitude, data[i].longitude);
                } else {
                    marker = new google.maps.Marker({
                        position: {lat: data[i].latitude, lng: data[i].longitude},
                        map: map,
                        icon: "http://203.148.172.106/pin/red.png",
                        title: data[i].name
                    });
                    attachSecretMessage(marker, data[i].name, data[i].latitude, data[i].longitude);
                }
            });
        }, failure: function (err) {
            myApp.alert(err.message, 'error');
        }
    });

    prehide();
}

function failure(message) {
    myApp.alert('กรุณาเปิดการใช้งาน location', 'น้ำมันเต็มลิตร');
}

//-------------------------------------------------------------------------------------------
function checkPermissions(callback) {
    //document.addEventListener('deviceready', function () {
        //try {
            //myApp.alert('checkPermissions', 'น้ำมันเต็มลิตร');

            let permissions = ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'];

            cordova.plugins.diagnostic.getPermissionsAuthorizationStatus(
                onCheckPermissions.bind(this, callback),
                onCheckPermissionsError,
                permissions
            );
        //} catch (error) {
            //myApp.alert("Error: " + error, 'น้ำมันเต็มลิตร');
        //}
    //});
}

function onCheckPermissions(callback, statuses) {
    //myApp.alert('onCheckPermissions', 'น้ำมันเต็มลิตร');

    var statusFineLocationPermission = statuses['ACCESS_FINE_LOCATION'];
    var statusCoarseLocationPermission = statuses['ACCESS_COARSE_LOCATION'];
    if (statusFineLocationPermission === 'GRANTED'
        && statusCoarseLocationPermission === 'GRANTED') {
        // ทำงานต่อไปได้
        callback();
    } else {
        // ขอ permission
        requestPermissions(callback);
    }
}

function onCheckPermissionsError(error) {
    //myApp.alert('onCheckPermissionsError', 'น้ำมันเต็มลิตร');

    myApp.alert('เกิดข้อผิดพลาดในการตรวจสอบสิทธิการใช้งานของแอพ: ' + error, 'น้ำมันเต็มลิตร');
}

function requestPermissions(callback) {
    let permissions = ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'];

    cordova.plugins.diagnostic.requestRuntimePermissions(
        onRequestPermissions.bind(this, callback),
        onRequestPermissionsError,
        permissions
    );
}

function onRequestPermissions(callback, statuses) {
    checkPermissions(callback);
}

function onRequestPermissionsError(error) {
    myApp.alert('เกิดข้อผิดพลาดในการขอสิทธิการใช้งาน: ' + error, 'น้ำมันเต็มลิตร');
}

//-------------------------------------------------------------------------------------------

function attachSecretMessage(marker, secretMessage, latitude, long) {
    var infowindow = new google.maps.InfoWindow({
        content: secretMessage
    });

    marker.addListener('click', function () {
        infowindow.open(marker.get('map'), marker);
        var addressLongLat = latitude + ',' + long;
        window.open("http://maps.google.com/?q=" + addressLongLat, '_system');
    });
}

function onSuccess(imageURI) {
    var image = document.getElementById('img');
    image.src = imageURI + '?' + Math.random();

    var options = new FileUploadOptions();
    options.fileKey = "avatar";
    options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
    options.mimeType = "image/jpeg";

    var params = {};
    params.value1 = "test";
    params.value2 = "param";

    options.params = params;
    options.chunkedMode = false;

    var ft = new FileTransfer();
    ft.upload(imageURI, "http://203.148.172.106/api/images/avatar", function (result) {

        var obj = JSON.parse(result.response);
        $$('input[name="re_profile"]').attr('value', obj.data);

    }, function (error) {
        myApp.alert(JSON.stringify(error), 'error');
    }, options);

}

function onFail(message) {
    myApp.alert('โปรดลองอีกครั้ง', 'น้ำมันเต็มลิตร');
}

function getHistory(type) {
    var uuid = device.uuid;
    var url = 'http://203.148.172.106/api/histories/' + type + '?uuid=' + uuid;


    var access_token = window.localStorage.getItem("access_token");
    let latitude = window.localStorage.getItem('near_latitude');
    let longitude = window.localStorage.getItem('near_longitude');

    var datalist = {"Authorization": "Bearer " + access_token, "Accept": "application/json"};

    $$.ajax({
        type: "GET",
        dataType: "json",
        url: url,
        headers: {"Authorization": access_token, "Accept": "application/json"},
        data: datalist,
        success: function (response) {
            $$("#table_history").html('');
            $$.each(response.data, function (i, item) {
                if (response.data[i].station) {
                    console.log(response.data[i].station)
                    let name = response.data[i].station.name.substring(0, 28);
                    if (response.data[i].station.name.length > 28) {
                        name += '...,';
                    }
                    let description = response.data[i].station.description.substring(0, 30);
                    let update_at = response.data[i].updated_at;
                    let profile = response.data[i].station.profile != null ? response.data[i].station.profile : '';
                    let log = response.data[i].description;

                    let html = '<div class="row content-list-left-right">\
                                    <div class="row col-100">\
                                        <center><a href="near_detail.html?id=' + response.data[i].station.id + '&latitude=' + latitude + '&longitude=' + longitude + '"><img src="' + profile + '" width="100%" style="border-radius:5%;"/></a></center>\
                                    </div>\
                                    <div class="row col-100" style="font-size:28px"><b>' + name + '</b></div>\
                                    <div class="row col-100" style="font-size:24px;">' + description + '</div>\
                                    <div class="row col-100" style="font-size:18px;color: green;">message: ' + log + '</div>\
                                    <div class="row col-100" style="font-size:18px;color: gray;">' + update_at + '</div>\
                                </div>';
                    $$('#history-block' + type).append(html);
                }

            });
        }
    });
}

function buildBrands() {
    var url = 'http://203.148.172.106/api/brands';
    myStorage = window.localStorage;
    var access_token = myStorage.getItem('access_token');
    let html = '<div class="row">';
    let counter = 0;
    $$.ajax({
        type: "GET",
        dataType: "json",
        url: url,
        headers: {"Authorization": access_token, "Accept": "application/json"},
        success: function (response) {
            $$.each(response.data, function (i, item) {
                var id = response.data[i]['id'];
                var img = response.data[i]['profile'];
                if (counter++ % 3 == 0) {
                    html += '</div><div class="row">';
                }
                html += '<div class="col-33">\
                                <label class="radio">\
                                    <input type="radio" name="brand_id" value="' + id + '" >\
                                    <img src="' + img + '" width="50" height="50">\
                                    <span class=""></span>\
                                </label>\
                            </div>';
            });
            for (let i = 0; i <= response.data.length - counter; i++) {
                html += '<div class="col-33"></div>';
            }

            html += "</div>";
            $$('#sel_brand').append(html);
        }
    });
}

function buildAtms() {
    var url = 'http://203.148.172.106/api/atms';
    myStorage = window.localStorage;
    var access_token = myStorage.getItem('access_token');
    let html = '<div class="row">';
    let counter = 0;
    $$.ajax({
        type: "GET",
        dataType: "json",
        url: url,
        headers: {"Authorization": access_token, "Accept": "application/json"},
        success: function (response) {
            $$.each(response.data, function (i, item) {
                var id = response.data[i]['id'];
                var img = response.data[i]['profile'];
                if (counter++ % 3 == 0) {
                    html += '</div><div class="row">';
                }
                html += '<div class="col-33">\
                                <label class="checkbox">\
                                    <input type="checkbox" name="atms" value="' + id + '" >\
                                    <img src="' + img + '" width="50">\
                                    <span class="checkmark"></span>\
                                </label>\
                            </div>'
            });
            for (let i = 0; i <= response.data.length - counter; i++) {
                html += '<div class="col-33"></div>';
            }

            html += "</div>";
            $$('#sel_atm').append(html);
        }
    });
}

function buildOilType() {
    var url = 'http://203.148.172.106/api/types';
    myStorage = window.localStorage;
    var access_token = myStorage.getItem('access_token');
    let html = '<div class="row">';
    let counter = 0;
    $$.ajax({
        type: "GET",
        dataType: "json",
        url: url,
        headers: {"Authorization": access_token, "Accept": "application/json"},
        success: function (response) {
            $$.each(response.data, function (i, item) {

                var id = response.data[i]['id'];
                var img = response.data[i]['profile'];

                html += '<div class="col-33">\
                                <label class="checkbox">\
                                    <input type="checkbox" name="types" value="' + id + '" >\
                                    <img src="' + img + '" width="50">\
                                    <span class="checkmark"></span>\
                                </label>\
                            </div>'
            });
            for (let i = 0; i <= response.data.length - counter; i++) {
                html += '<div class="col-33"></div>';
            }
            html += "</div>";
            $$('#sel_type').append(html);
        }
    });
}

function buildPumpType() {
    var url = 'http://203.148.172.106/api/pumptypes';
    myStorage = window.localStorage;
    var access_token = myStorage.getItem('access_token');
    let html = '<div class="row">';
    let counter = 0;
    $$.ajax({
        type: "GET",
        dataType: "json",
        url: url,
        headers: {"Authorization": access_token, "Accept": "application/json"},
        success: function (response) {
            $$.each(response.data, function (i, item) {
                var id = response.data[i]['id'];
                var img = response.data[i]['profile'];
                html += '<div class="col-33">\
                                <label class="radio">\
                                    <input type="radio" name="pump_type_id" value="' + id + '" >\
                                    <img src="' + img + '" width="50">\
                                    <span class="checkmark"></span>\
                                </label>\
                            </div>';
            });
            for (let i = 0; i <= response.data.length - counter; i++) {
                html += '<div class="col-33"></div>';
            }
            html += '</div>';
            $$('#sel_pump_type').append(html);
        }
    });
}

function buildStandard() {
    var url = 'http://203.148.172.106/api/standards';
    let html = '<div class="row">';
    let counter = 0;
    myStorage = window.localStorage;
    var access_token = myStorage.getItem('access_token');
    $$.ajax({
        type: "GET",
        dataType: "json",
        url: url,
        headers: {"Authorization": access_token, "Accept": "application/json"},
        success: function (response) {
            $$.each(response.data, function (i, item) {
                var id = response.data[i]['id'];
                var img = response.data[i]['profile'];
                html += '<div class="col-33">\
                                <label class="radio">\
                                    <input type="radio" name="standard_id" value="' + id + '" >\
                                    <img src="' + img + '" width="50">\
                                    <span class="checkmark"></span>\
                                </label>\
                            </div>';
            });
            for (let i = 0; i <= response.data.length - counter; i++) {
                html += '<div class="col-33"></div>';
            }
            html += '</div>';
            $$('#sel_station').append(html);
        }
    });
}