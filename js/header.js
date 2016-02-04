var debug = true; // in development stage

var Config = {
    html5mode: true
};
var Services = {
    base: 'http://192.168.103.250:83/'
    , login: 'http://www.irinn.ir:8080/webservice.asmx/getToken'
    , items: 'content/ott.json'
    , query: 'query/getsectionjson/'
    , itemsT: '/data/ott.json'
    , queryT: '/data/section.json'
};
var Request = {
    log: function (data) {
        console.log(data);
        return false;
    }
};
var Location = {
    splitter: '#'
    , parts: []
    , history: []
    , 'setParts': {set: function (x) {
            this.parts = x;
        }}
    , init: function () {
        $(window).on('hashchange', function () {
            var fragments = location.href.split(Location.splitter)[1];
            Location.parts = Location.parse(fragments);
            if (Location.parts[0] === 'history' && Location.parts[1] === 'back')
                if (Location.history.length > 1)
                    Location.goBack();
                else
                    Location.redirect(false, 'dashboard/items');
            Location.history.push(fragments);
        });
        // init on-render tools
    }
    , getCurrent: function () {
        var fragments = location.href.split(Location.splitter)[1];
        Location.history.push(fragments);
        Location.parts = Location.parse(fragments);
    }
    , get: function(full) {
        return (typeof full !== "undefined" && full === true) ? location.href : location.pathname;
    }
    , parse: function (fragments) {
        if (typeof fragments !== "undefined") {
            var parts = fragments.split('/');
            Location.parts = parts;
            debug && console.log(parts);
            return parts;
        } else {
            debug && console.warn('no url fragments');
            Location.redirect(false, 'dashboard/items');
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
    , paths: {
        
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

// Check token
var token = Cookie.check();
if (typeof token === "undefined" || token === null)
    if (Location.get() !== '/login.html')
        Location.redirect('/login.html');