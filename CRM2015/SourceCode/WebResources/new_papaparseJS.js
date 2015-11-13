/*!
	Papa Parse
	v4.1.0
	https://github.com/mholt/PapaParse
*/
! (function (e) {
    "use strict";
    function u(t, n) {
        n = n || {};
        if (n.worker && Papa.WORKERS_SUPPORTED) {
            var r = m();
            r.userStep = n.step;
            r.userChunk = n.chunk;
            r.userComplete = n.complete;
            r.userError = n.error;
            n.step = x(n.step);
            n.chunk = x(n.chunk);
            n.complete = x(n.complete);
            n.error = x(n.error);
            delete n.worker;
            r.postMessage({
                input: t,
                config: n,
                workerId: r.id
            });
            return
        }
        var i = null;
        if (typeof t === "string") {
            if (n.download) i = new l(n);
            else i = new h(n)
        } else if (e.File && t instanceof File || t instanceof Object) i = new c(n);
        return i.stream(t)
    }
    function a(t, n) {
        function a() {
            if (typeof n !== "object") return;
            if (typeof n.delimiter === "string" && n.delimiter.length == 1 && e.Papa.BAD_DELIMITERS.indexOf(n.delimiter) == -1) {
                o = n.delimiter
            }
            if (typeof n.quotes === "boolean" || n.quotes instanceof Array) s = n.quotes;
            if (typeof n.newline === "string") u = n.newline
        }
        function f(e) {
            if (typeof e !== "object") return [];
            var t = [];
            for (var n in e) t.push(n);
            return t
        }
        function l(e, t) {
            var n = "";
            if (typeof e === "string") e = JSON.parse(e);
            if (typeof t === "string") t = JSON.parse(t);
            var r = e instanceof Array && e.length > 0;
            var i = !(t[0] instanceof Array);
            if (r) {
                for (var s = 0; s < e.length; s++) {
                    if (s > 0) n += o;
                    n += c(e[s], s)
                }
                if (t.length > 0) n += u
            }
            for (var a = 0; a < t.length; a++) {
                var f = r ? e.length : t[a].length;
                for (var l = 0; l < f; l++) {
                    if (l > 0) n += o;
                    var h = r && i ? e[l] : l;
                    n += c(t[a][h], l)
                }
                if (a < t.length - 1) n += u
            }
            return n
        }
        function c(t, n) {
            if (typeof t === "undefined" || t === null) return "";
            t = t.toString().replace(/"/g, '""');
            var r = typeof s === "boolean" && s || s instanceof Array && s[n] || h(t, e.Papa.BAD_DELIMITERS) || t.indexOf(o) > -1 || t.charAt(0) == " " || t.charAt(t.length - 1) == " ";
            return r ? '"' + t + '"' : t
        }
        function h(e, t) {
            for (var n = 0; n < t.length; n++) if (e.indexOf(t[n]) > -1) return true;
            return false
        }
        var r = "";
        var i = [];
        var s = false;
        var o = ",";
        var u = "\r\n";
        a();
        if (typeof t === "string") t = JSON.parse(t);
        if (t instanceof Array) {
            if (!t.length || t[0] instanceof Array) return l(null, t);
            else if (typeof t[0] === "object") return l(f(t[0]), t)
        } else if (typeof t === "object") {
            if (typeof t.data === "string") t.data = JSON.parse(t.data);
            if (t.data instanceof Array) {
                if (!t.fields) t.fields = t.data[0] instanceof Array ? t.fields : f(t.data[0]);
                if (! (t.data[0] instanceof Array) && typeof t.data[0] !== "object") t.data = [t.data]
            }
            return l(t.fields || [], t.data || [])
        }
        throw "exception: Unable to serialize unrecognized input"
    }
    function f(n) {
        function r(e) {
            var t = E(e);
            t.chunkSize = parseInt(t.chunkSize);
            this._handle = new p(t);
            this._handle.streamer = this;
            this._config = t
        }
        this._handle = null;
        this._paused = false;
        this._finished = false;
        this._input = null;
        this._baseIndex = 0;
        this._partialLine = "";
        this._rowCount = 0;
        this._start = 0;
        this._nextChunk = null;
        r.call(this, n);
        this.parseChunk = function (n) {
            var r = this._partialLine + n;
            this._partialLine = "";
            var i = this._handle.parse(r, this._baseIndex, !this._finished);
            if (this._handle.paused()) return;
            var s = i.meta.cursor;
            if (!this._finished) {
                this._partialLine = r.substring(s - this._baseIndex);
                this._baseIndex = s
            }
            if (i && i.data) this._rowCount += i.data.length;
            var o = this._finished || this._config.preview && this._rowCount >= this._config.preview;
            if (t) {
                e.postMessage({
                    results: i,
                    workerId: Papa.WORKER_ID,
                    finished: o
                })
            } else if (x(this._config.chunk)) {
                this._config.chunk(i, this._handle);
                if (this._paused) return;
                i = undefined
            }
            if (o && x(this._config.complete) && (!i || !i.meta.aborted)) this._config.complete(i);
            if (!o && (!i || !i.meta.paused)) this._nextChunk();
            return i
        };
        this._sendError = function (n) {
            if (x(this._config.error)) this._config.error(n);
            else if (t && this._config.error) {
                e.postMessage({
                    workerId: Papa.WORKER_ID,
                    error: n,
                    finished: false
                })
            }
        }
    }
    function l(e) {
        function r(e) {
            var t = e.getResponseHeader("Content-Range");
            return parseInt(t.substr(t.lastIndexOf("/") + 1))
        }
        e = e || {};
        if (!e.chunkSize) e.chunkSize = Papa.RemoteChunkSize;
        f.call(this, e);
        var n;
        if (t) {
            this._nextChunk = function () {
                this._readChunk();
                this._chunkLoaded()
            }
        } else {
            this._nextChunk = function () {
                this._readChunk()
            }
        }
        this.stream = function (e) {
            this._input = e;
            this._nextChunk()
        };
        this._readChunk = function () {
            if (this._finished) {
                this._chunkLoaded();
                return
            }
            n = new XMLHttpRequest;
            if (!t) {
                n.onload = S(this._chunkLoaded, this);
                n.onerror = S(this._chunkError, this)
            }
            n.open("GET", this._input, !t);
            if (this._config.step || this._config.chunk) {
                var e = this._start + this._config.chunkSize - 1;
                n.setRequestHeader("Range", "bytes=" + this._start + "-" + e);
                n.setRequestHeader("If-None-Match", "webkit-no-cache")
            }
            try {
                n.send()
            } catch(r) {
                this._chunkError(r.message)
            }
            if (t && n.status == 0) this._chunkError();
            else this._start += this._config.chunkSize
        };
        this._chunkLoaded = function () {
            if (n.readyState != 4) return;
            if (n.status < 200 || n.status >= 400) {
                this._chunkError();
                return
            }
            this._finished = !this._config.step && !this._config.chunk || this._start > r(n);
            this.parseChunk(n.responseText)
        };
        this._chunkError = function (e) {
            var t = n.statusText || e;
            this._sendError(t)
        }
    }
    function c(e) {
        e = e || {};
        if (!e.chunkSize) e.chunkSize = Papa.LocalChunkSize;
        f.call(this, e);
        var t, n;
        var r = typeof FileReader !== "undefined";
        this.stream = function (e) {
            this._input = e;
            n = e.slice || e.webkitSlice || e.mozSlice;
            if (r) {
                t = new FileReader;
                t.onload = S(this._chunkLoaded, this);
                t.onerror = S(this._chunkError, this)
            } else t = new FileReaderSync;
            this._nextChunk()
        };
        this._nextChunk = function () {
            if (!this._finished && (!this._config.preview || this._rowCount < this._config.preview)) this._readChunk()
        };
        this._readChunk = function () {
            var e = Math.min(this._start + this._config.chunkSize, this._input.size);
            var i = t.readAsText(n.call(this._input, this._start, e), this._config.encoding);
            if (!r) this._chunkLoaded({
                target: {
                    result: i
                }
            })
        };
        this._chunkLoaded = function (e) {
            this._start += this._config.chunkSize;
            this._finished = this._start >= this._input.size;
            this.parseChunk(e.target.result)
        };
        this._chunkError = function () {
            this._sendError(t.error)
        }
    }
    function h(e) {
        e = e || {};
        f.call(this, e);
        var t;
        var n;
        this.stream = function (e) {
            t = e;
            n = e;
            return this._nextChunk()
        };
        this._nextChunk = function () {
            if (this._finished) return;
            var e = this._config.chunkSize;
            var t = e ? n.substr(0, e) : n;
            n = e ? n.substr(e) : "";
            this._finished = !n;
            return this.parseChunk(t)
        }
    }
    function p(e) {
        function c() {
            if (f && u) {
                b("Delimiter", "UndetectableDelimiter", "Unable to auto-detect delimiting character; defaulted to '" + Papa.DefaultDelimiter + "'");
                u = false
            }
            if (e.skipEmptyLines) {
                for (var t = 0; t < f.data.length; t++) if (f.data[t].length == 1 && f.data[t][0] == "") f.data.splice(t--, 1)
            }
            if (h()) p();
            return v()
        }
        function h() {
            return e.header && a.length == 0
        }
        function p() {
            if (!f) return;
            for (var e = 0; h() && e < f.data.length; e++) for (var t = 0; t < f.data[e].length; t++) a.push(f.data[e][t]);
            f.data.splice(0, 1)
        }
        function v() {
            if (!f || !e.header && !e.dynamicTyping) return f;
            for (var t = 0; t < f.data.length; t++) {
                var n = {};
                for (var r = 0; r < f.data[t].length; r++) {
                    if (e.dynamicTyping) {
                        var i = f.data[t][r];
                        if (i == "true") f.data[t][r] = true;
                        else if (i == "false") f.data[t][r] = false;
                        else f.data[t][r] = y(i)
                    }
                    if (e.header) {
                        if (r >= a.length) {
                            if (!n["__parsed_extra"]) n["__parsed_extra"] = [];
                            n["__parsed_extra"].push(f.data[t][r])
                        } else n[a[r]] = f.data[t][r]
                    }
                }
                if (e.header) {
                    f.data[t] = n;
                    if (r > a.length) b("FieldMismatch", "TooManyFields", "Too many fields: expected " + a.length + " fields but parsed " + r, t);
                    else if (r < a.length) b("FieldMismatch", "TooFewFields", "Too few fields: expected " + a.length + " fields but parsed " + r, t)
                }
            }
            if (e.header && f.meta) f.meta.fields = a;
            return f
        }
        function m(t) {
            var n = [",", "	", "|", ";", Papa.RECORD_SEP, Papa.UNIT_SEP];
            var r, i, s;
            for (var o = 0; o < n.length; o++) {
                var u = n[o];
                var a = 0,
                f = 0;
                s = undefined;
                var l = (new d({
                    delimiter: u,
                    preview: 10
                })).parse(t);
                for (var c = 0; c < l.data.length; c++) {
                    var h = l.data[c].length;
                    f += h;
                    if (typeof s === "undefined") {
                        s = h;
                        continue
                    } else if (h > 1) {
                        a += Math.abs(h - s);
                        s = h
                    }
                }
                f /= l.data.length;
                if ((typeof i === "undefined" || a < i) && f > 1.99) {
                    i = a;
                    r = u
                }
            }
            e.delimiter = r;
            return {
                successful: !!r,
                bestDelimiter: r
            }
        }
        function g(e) {
            e = e.substr(0, 1024 * 1024);
            var t = e.split("\r");
            if (t.length == 1) return "\n";
            var n = 0;
            for (var r = 0; r < t.length; r++) {
                if (t[r][0] == "\n") n++
            }
            return n >= t.length / 2 ? "\r\n" : "\r"
        }
        function y(e) {
            var n = t.test(e);
            return n ? parseFloat(e) : e
        }
        function b(e, t, n, r) {
            f.errors.push({
                type: e,
                code: t,
                message: n,
                row: r
            })
        }
        var t = /^\s*-?(\d*\.?\d+|\d+\.?\d*)(e[-+]?\d+)?\s*$/i;
        var n = this;
        var r = 0;
        var i;
        var s;
        var o = false;
        var u;
        var a = [];
        var f = {
            data: [],
            errors: [],
            meta: {}
        };
        if (x(e.step)) {
            var l = e.step;
            e.step = function (t) {
                f = t;
                if (h()) c();
                else {
                    c();
                    if (f.data.length == 0) return;
                    r += t.data.length;
                    if (e.preview && r > e.preview) s.abort();
                    else l(f, n)
                }
            }
        }
        this.parse = function (t, n, r) {
            if (!e.newline) e.newline = g(t);
            u = false;
            if (!e.delimiter) {
                var a = m(t);
                if (a.successful) e.delimiter = a.bestDelimiter;
                else {
                    u = true;
                    e.delimiter = Papa.DefaultDelimiter
                }
                f.meta.delimiter = e.delimiter
            }
            var l = E(e);
            if (e.preview && e.header) l.preview++;
            i = t;
            s = new d(l);
            f = s.parse(i, n, r);
            c();
            return o ? {
                meta: {
                    paused: true
                }
            } : f || {
                meta: {
                    paused: false
                }
            }
        };
        this.paused = function () {
            return o
        };
        this.pause = function () {
            o = true;
            s.abort();
            i = i.substr(s.getCharIndex())
        };
        this.resume = function () {
            o = false;
            n.streamer.parseChunk(i)
        };
        this.abort = function () {
            s.abort();
            if (x(e.complete)) e.complete(f);
            i = ""
        }
    }
    function d(e) {
        e = e || {};
        var t = e.delimiter;
        var n = e.newline;
        var r = e.comments;
        var i = e.step;
        var s = e.preview;
        var o = e.fastMode;
        if (typeof t !== "string" || t.length != 1 || Papa.BAD_DELIMITERS.indexOf(t) > -1) t = ",";
        if (r === t) throw "Comment character same as delimiter";
        else if (r === true) r = "#";
        else if (typeof r !== "string" || Papa.BAD_DELIMITERS.indexOf(r) > -1) r = false;
        if (n != "\n" && n != "\r" && n != "\r\n") n = "\n";
        var u = 0;
        var a = false;
        this.parse = function (e, f, l) {
            function C(e) {
                m.push(e);
                b = u
            }
            function k(t) {
                if (l) return A();
                if (!t) t = e.substr(u);
                y.push(t);
                u = c;
                C(y);
                if (v) O();
                return A()
            }
            function L(t) {
                u = t;
                C(y);
                y = [];
                x = e.indexOf(n, u)
            }
            function A(e) {
                return {
                    data: m,
                    errors: g,
                    meta: {
                        delimiter: t,
                        linebreak: n,
                        aborted: a,
                        truncated: !!e,
                        cursor: b + (f || 0)
                    }
                }
            }
            function O() {
                i(A());
                m = [],
                g = []
            }
            if (typeof e !== "string") throw "Input must be a string";
            var c = e.length,
            h = t.length,
            p = n.length,
            d = r.length;
            var v = typeof i === "function";
            u = 0;
            var m = [],
            g = [],
            y = [],
            b = 0;
            if (!e) return A();
            if (o || o !== false && e.indexOf('"') === -1) {
                var w = e.split(n);
                for (var E = 0; E < w.length; E++) {
                    var y = w[E];
                    u += y.length;
                    if (E !== w.length - 1) u += n.length;
                    else if (l) return A();
                    if (r && y.substr(0, d) == r) continue;
                    if (v) {
                        m = [];
                        C(y.split(t));
                        O();
                        if (a) return A()
                    } else C(y.split(t));
                    if (s && E >= s) {
                        m = m.slice(0, s);
                        return A(true)
                    }
                }
                return A()
            }
            var S = e.indexOf(t, u);
            var x = e.indexOf(n, u);
            for (;;) {
                if (e[u] == '"') {
                    var T = u;
                    u++;
                    for (;;) {
                        var T = e.indexOf('"', T + 1);
                        if (T === -1) {
                            if (!l) {
                                g.push({
                                    type: "Quotes",
                                    code: "MissingQuotes",
                                    message: "Quoted field unterminated",
                                    row: m.length,
                                    index: u
                                })
                            }
                            return k()
                        }
                        if (T === c - 1) {
                            var N = e.substring(u, T).replace(/""/g, '"');
                            return k(N)
                        }
                        if (e[T + 1] == '"') {
                            T++;
                            continue
                        }
                        if (e[T + 1] == t) {
                            y.push(e.substring(u, T).replace(/""/g, '"'));
                            u = T + 1 + h;
                            S = e.indexOf(t, u);
                            x = e.indexOf(n, u);
                            break
                        }
                        if (e.substr(T + 1, p) === n) {
                            y.push(e.substring(u, T).replace(/""/g, '"'));
                            L(T + 1 + p);
                            S = e.indexOf(t, u);
                            if (v) {
                                O();
                                if (a) return A()
                            }
                            if (s && m.length >= s) return A(true);
                            break
                        }
                    }
                    continue
                }
                if (r && y.length === 0 && e.substr(u, d) === r) {
                    if (x == -1) return A();
                    u = x + p;
                    x = e.indexOf(n, u);
                    S = e.indexOf(t, u);
                    continue
                }
                if (S !== -1 && (S < x || x === -1)) {
                    y.push(e.substring(u, S));
                    u = S + h;
                    S = e.indexOf(t, u);
                    continue
                }
                if (x !== -1) {
                    y.push(e.substring(u, x));
                    L(x + p);
                    if (v) {
                        O();
                        if (a) return A()
                    }
                    if (s && m.length >= s) return A(true);
                    continue
                }
                break
            }
            return k()
        };
        this.abort = function () {
            a = true
        };
        this.getCharIndex = function () {
            return u
        }
    }
    function v() {
        var e = document.getElementsByTagName("script");
        return e.length ? e[e.length - 1].src : ""
    }
    function m() {
        if (!Papa.WORKERS_SUPPORTED) return false;
        if (!n && Papa.SCRIPT_PATH === null) throw new Error("Script path cannot be determined automatically when Papa Parse is loaded asynchronously. " + "You need to set Papa.SCRIPT_PATH manually.");
        var t = new e.Worker(Papa.SCRIPT_PATH || r);
        t.onmessage = g;
        t.id = s++;
        i[t.id] = t;
        return t
    }
    function g(e) {
        var t = e.data;
        var n = i[t.workerId];
        var r = false;
        if (t.error) n.userError(t.error, t.file);
        else if (t.results && t.results.data) {
            var s = function () {
                r = true;
                y(t.workerId, {
                    data: [],
                    errors: [],
                    meta: {
                        aborted: true
                    }
                })
            };
            var o = {
                abort: s,
                pause: b,
                resume: b
            };
            if (x(n.userStep)) {
                for (var u = 0; u < t.results.data.length; u++) {
                    n.userStep({
                        data: [t.results.data[u]],
                        errors: t.results.errors,
                        meta: t.results.meta
                    },
                    o);
                    if (r) break
                }
                delete t.results
            } else if (x(n.userChunk)) {
                n.userChunk(t.results, o, t.file);
                delete t.results
            }
        }
        if (t.finished && !r) y(t.workerId, t.results)
    }
    function y(e, t) {
        var n = i[e];
        if (x(n.userComplete)) n.userComplete(t);
        n.terminate();
        delete i[e]
    }
    function b() {
        throw "Not implemented."
    }
    function w(t) {
        var n = t.data;
        if (typeof Papa.WORKER_ID === "undefined" && n) Papa.WORKER_ID = n.workerId;
        if (typeof n.input === "string") {
            e.postMessage({
                workerId: Papa.WORKER_ID,
                results: Papa.parse(n.input, n.config),
                finished: true
            })
        } else if (e.File && n.input instanceof File || n.input instanceof Object) {
            var r = Papa.parse(n.input, n.config);
            if (r) e.postMessage({
                workerId: Papa.WORKER_ID,
                results: r,
                finished: true
            })
        }
    }
    function E(e) {
        if (typeof e !== "object") return e;
        var t = e instanceof Array ? [] : {};
        for (var n in e) t[n] = E(e[n]);
        return t
    }
    function S(e, t) {
        return function () {
            e.apply(t, arguments)
        }
    }
    function x(e) {
        return typeof e === "function"
    }
    var t = !e.document,
    n = false,
    r;
    var i = {},
    s = 0;
    e.Papa = {};
    e.Papa.parse = u;
    e.Papa.unparse = a;
    e.Papa.RECORD_SEP = String.fromCharCode(30);
    e.Papa.UNIT_SEP = String.fromCharCode(31);
    e.Papa.BYTE_ORDER_MARK = "﻿";
    e.Papa.BAD_DELIMITERS = ["\r", "\n", '"', e.Papa.BYTE_ORDER_MARK];
    e.Papa.WORKERS_SUPPORTED = !!e.Worker;
    e.Papa.SCRIPT_PATH = null;
    e.Papa.LocalChunkSize = 1024 * 1024 * 10;
    e.Papa.RemoteChunkSize = 1024 * 1024 * 5;
    e.Papa.DefaultDelimiter = ",";
    e.Papa.Parser = d;
    e.Papa.ParserHandle = p;
    e.Papa.NetworkStreamer = l;
    e.Papa.FileStreamer = c;
    e.Papa.StringStreamer = h;
    if (e.jQuery) {
        var o = e.jQuery;
        o.fn.parse = function (t) {
            function i() {
                if (r.length == 0) {
                    if (x(t.complete)) t.complete();
                    return
                }
                var e = r[0];
                if (x(t.before)) {
                    var n = t.before(e.file, e.inputElem);
                    if (typeof n === "object") {
                        if (n.action == "abort") {
                            s("AbortError", e.file, e.inputElem, n.reason);
                            return
                        } else if (n.action == "skip") {
                            u();
                            return
                        } else if (typeof n.config === "object") e.instanceConfig = o.extend(e.instanceConfig, n.config)
                    } else if (n == "skip") {
                        u();
                        return
                    }
                }
                var i = e.instanceConfig.complete;
                e.instanceConfig.complete = function (t) {
                    if (x(i)) i(t, e.file, e.inputElem);
                    u()
                };
                Papa.parse(e.file, e.instanceConfig)
            }
            function s(e, n, r, i) {
                if (x(t.error)) t.error({
                    name: e
                },
                n, r, i)
            }
            function u() {
                r.splice(0, 1);
                i()
            }
            var n = t.config || {};
            var r = [];
            this.each(function (t) {
                var i = o(this).prop("tagName").toUpperCase() == "INPUT" && o(this).attr("type").toLowerCase() == "file" && e.FileReader;
                if (!i || !this.files || this.files.length == 0) return true;
                for (var s = 0; s < this.files.length; s++) {
                    r.push({
                        file: this.files[s],
                        inputElem: this,
                        instanceConfig: o.extend({},
                        n)
                    })
                }
            });
            i();
            return this
        }
    }
    if (t) {
        e.onmessage = w
    } else if (Papa.WORKERS_SUPPORTED) {
        r = v();
        if (!document.body) {
            n = true
        } else {
            document.addEventListener("DOMContentLoaded", function () {
                n = true
            },
            true)
        }
    }
    l.prototype = Object.create(f.prototype);
    l.prototype.constructor = l;
    c.prototype = Object.create(f.prototype);
    c.prototype.constructor = c;
    h.prototype = Object.create(h.prototype);
    h.prototype.constructor = h
})(this);