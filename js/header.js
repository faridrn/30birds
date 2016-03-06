var debug = true; // in development stage

var Config = {
    html5mode: true
    , paths: ['home', 'vod', 'live', 'aod']
};
var Global = {
    pageTitle: '30Birds'
    , getLinkParams: function ($obj) {
        var href;
        if (Location.get().indexOf(Location.parent) === -1)
            href = Location.parent + '/' + $obj.attr('href');
        else
            href = '/' + Location.get() + '/' + Global.trimChar($obj.attr('href'), '/');
        return {
            href: href
            , title: $obj.attr('href').split('-')[1].replace('/', '')
        };
    }
    , t: function (full) {
        if (typeof full !== "undefined" && full === true)
            return (new Date).getTime();
        else
            return ((new Date).getTime()).toString().substr(8);
    }
    , Player: {
        setup: function (obj, file, image) {
            jwplayer(obj).setup({
                abouttext: "30Birds"
                , aboutlink: "http://"
                , file: file
                , image: image
                , width: '100%'
                , aspectratio: '16:9'
                , stretching: "uniform"
                , controls: !0
                , autostart: !1
            });
        }
        , remove: function (obj) {
            jwplayer(obj).remove();
        }
    }
    , trimChar: function (string, charToRemove) {
        while (string.charAt(0) === charToRemove)
            string = string.substring(1);
        while (string.charAt(string.length - 1) === charToRemove)
            string = string.substring(0, string.length - 1);
        return string;
    }
    , convertTime: function (timestamp) {
        var d = new Date(timestamp * 1000), // Convert the passed timestamp to milliseconds
                yyyy = d.getFullYear(),
                mm = ('0' + (d.getMonth() + 1)).slice(-2), // Months are zero based. Add leading 0.
                dd = ('0' + d.getDate()).slice(-2), // Add leading 0.
                hh = d.getHours(),
                h = hh,
                min = ('0' + d.getMinutes()).slice(-2), // Add leading 0.
                ampm = 'AM',
                time;
        if (hh > 12) {
            h = hh - 12;
            ampm = 'PM';
        } else if (hh === 12) {
            h = 12;
            ampm = 'PM';
        } else if (hh === 0) {
            h = 12;
        }
        // ie: 2013-02-18, 8:35 AM	
        time = yyyy + '-' + mm + '-' + dd + ' ' + h + ':' + min + ' ' + ampm;
        return time;
    }
};
var Services = {
    base: 'http://217.218.67.231/'
    , login: 'http://www.irinn.ir:8080/webservice.asmx/getToken'
    , homeItems: 'content/{pid}.json'
    , homeItems2: '/data/parstoday.json'
    , vodItems: 'content/{pid}.json'
    , liveItems: 'content/live.json'
//    , aodItems: 'content/live.json'
    , vodQuery: 'query/getsectionjson/{id}'
};
var Request = {
    log: function (data) {
        console.log(data);
        return false;
    }
};
var Location = {
    splitter: '/'
    , parts: []
    , parent: ''
    , init: function (again) {
        debug && !again && console.log(Global.t() + ' Location.init()');
        Location.parts = Location.getCurrent();
//        console.log(Location.parts[0]);
//        return;
        Location.parent = Location.parts[0];
        if (!Location.parts.length || Location.parts[0] === "" || ($.inArray(Location.parts[0], Config.paths) < 0)) {
            history.pushState(null, Global.pageTitle, '/home');
            Location.parent = 'home';
            debug && console.log(Global.t() + ' Location.init() again! because location changed suddenly.');
            Location.init(true);
        }
        // init on-render tools
    }
    , getCurrent: function () {
        var fragments = [];
        var f = location.pathname.replace('http://', '').replace('https://', '').replace('www', '').split(Location.splitter);
        for (i = 0; i < f.length; i++)
            if (f[i] !== "")
                fragments.push(f[i]);
        debug && console.log(Global.t() + ' Current Location parts: ' + fragments);
//        Location.parts = fragments;
        return fragments;
    }
    , get: function (full) {
        return (typeof full !== "undefined" && full === true) ? location.href : Global.trimChar(location.pathname, '/');
    }
    , parse: function (fragments) {
        if (typeof fragments !== "undefined") {
            var parts = fragments.split('/');
            Location.parts = parts;
            debug && console.log(Global.t() + ' Location Parts: ' + parts);
            return parts;
        } else {
            return false;
        }
        return false;
    }
    , goBack: function (back) {
        if (typeof back !== "undefined" && back === true) {
            debug && console.log('Redirecting to: Previous page');
            var redirect = Location.history[Location.history.length - 2];
            window.location.href = ((Config.html5mode === false) ? '#' : '') + redirect;
        }
    }
    , redirect: function (url, forceLegacyMode) {
        debug && console.log('Redirecting to:' + url);
        window.location.href = (((Config.html5mode === false || (typeof forceLegacyMode !== "undefined" && forceLegacyMode === true))) ? '#' : '') + url;
        return true;
    }
    , refresh: function () {
        location.reload();
    }
};
var Cookie = {
    lifetime: 1209600 // exp in minutes
    , title: 'thirtybirdstoken='
    , extend: function (id, username, cname) {
        // Cookie.delete();
        Cookie.set(id, username, cname);
        debug && console.log('Cookies: Session Extended');
        return true;
    }
    , check: function () {
        return Cookie.get(Cookie.title);
    }
    , parse: function (data) {
        if (typeof data !== 'undefined') {
            return data;
        }
        return false;
    }
    , delete: function (cname) {
        if (typeof cname === 'undefined')
            var cname = Cookie.title;
        var expires = 'Thu, 01 Jan 1970 00:00:01 GMT';
        document.cookie = cname + '' + '; ' + expires + '; path=/';
    }
    , set: function (token, redirect) {
        // validating paramters
        var cname = Cookie.title;
        var data = token;
        var d = new Date();
        d.setTime(d.getTime() + (Cookie.lifetime * 1000));
        var expires = 'expires=' + d.toGMTString();
        document.cookie = cname + data + '; ' + expires + '; path=/';

        if (typeof redirect !== "undefined" && redirect !== "")
            Location.redirect(redirect);

        return data;
    }
    , get: function (name) {
        if (typeof name === 'undefined')
            var name = Cookie.title;
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(name) === 0)
                return Cookie.parse(c.substring(name.length, c.length));
        }
        return null;
    }
};

// Plugins
$.fn.serializeObject = function () { // serializeArray - serialize form as an array instead of default object
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

// Location change
(function (history) {
    var pushState = history.pushState;
    history.pushState = function (state) {
        if (typeof history.onpushstate === "function") {
            history.onpushstate({state: state});
        }
        // ... whatever else you want to do
        // maybe call onhashchange e.handler
        return pushState.apply(history, arguments);
    };
})(window.history);

// Check token
var token = Cookie.check();
//if (typeof token === "undefined" || token === null)
//    if (Location.get() !== '/login.html')
//        Location.redirect('/login.html');
//Location.init();