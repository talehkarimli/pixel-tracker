(function () {
    'use strict';

    // ===========================
    // CONFIG — CHANGE ONLY SITE KEY
    // ===========================
    var TRACK_ENDPOINT = "https://fringelike-renae-unterrific.ngrok-free.dev/api/track/";
    
    // Script tagdan Site Key oxu
    var script = document.currentScript || document.querySelector('script[data-site-key]');
    if (!script) return console.error("Pixel: script not found");

    var SITE_KEY = script.getAttribute("data-site-key");
    if (!SITE_KEY) return console.error("Pixel: missing data-site-key");

    // ===========================
    // VISITOR + SESSION ID
    // ===========================
    function getCookie(name) {
        return document.cookie.split(name + "=")[1]?.split(";")[0];
    }

    function setCookie(name, value, days) {
        var expires = "";
        if (days) {
            var d = new Date();
            d.setTime(d.getTime() + days * 86400000);
            expires = "; expires=" + d.toUTCString();
        }
        document.cookie = name + "=" + value + expires + "; path=/; SameSite=Lax";
    }

    function getVisitorId() {
        var id = getCookie("nyse_vid");
        if (!id) {
            id = "vis_" + Date.now() + "_" + Math.random().toString(36).slice(2);
            setCookie("nyse_vid", id, 180);
        }
        return id;
    }

    function getSessionId() {
        var id = sessionStorage.getItem("nyse_sid");
        if (!id) {
            id = "ses_" + Date.now() + "_" + Math.random().toString(36).slice(2);
            sessionStorage.setItem("nyse_sid", id);
        }
        return id;
    }

    var visitorId = getVisitorId();
    var sessionId = getSessionId();

    // ===========================
    // SEND EVENT
    // ===========================
    function sendEvent(type, extra) {
        var payload = {
            site_key: SITE_KEY,
            visitor_id: visitorId,
            session_id: sessionId,
            event_type: type,
            page_url: location.href,
            referrer: document.referrer || "",
            event_data: extra || {}
        };

        var xhr = new XMLHttpRequest();
        xhr.open("POST", TRACK_ENDPOINT, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(payload));
    }

    // ===========================
    // AUTO TRACK PAGE VIEW
    // ===========================
    sendEvent("page_view", {
        viewport: {
            w: window.innerWidth,
            h: window.innerHeight
        }
    });

    // ===========================
    // SIMPLE EMAIL CAPTURE
    // ===========================
    function watchEmailInputs() {
        document.querySelectorAll('input[type="email"]').forEach(function (input) {
            input.addEventListener("blur", function () {
                var email = input.value.trim();
                if (email && email.includes("@")) {
                    sendEvent("identify", { email: email });
                }
            });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", watchEmailInputs);
    } else {
        watchEmailInputs();
    }

    // ===========================
    // PUBLIC API
    // ===========================
    window.Pixel = {
        track: sendEvent,
        identify: function (email) {
            sendEvent("identify", { email: email });
        }
    };

    console.log("pixel loaded");
})();
