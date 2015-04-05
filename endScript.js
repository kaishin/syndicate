function extractPageFeeds() {
  var feeds = {};

  feeds["site"] = window.location.href;
  if (feeds["site"] === "favorites://") { return };

  feeds["list"] = [];
  var headLinks = document.getElementsByTagName("head")[0].getElementsByTagName("link");

  for (var i = 0; i < headLinks.length; i++) {
    var link = headLinks[i];

    if (link.attributes.getNamedItem("rel") !== null && link.attributes.getNamedItem("rel").value == "alternate") {
      var type = link.attributes.getNamedItem("type");

      if (type !== null) {
        var typeValue = type.value;

        if (typeValue === "application/rss+xml" || typeValue === "application/atom+xml" || typeValue === "text/xml") {
          var href = link.attributes.getNamedItem("href").value;

          if (href) {
            feeds["list"].push({url: _fullUrl(href), title: titleFromType(typeValue), type: typeFromString(typeValue)});
          }
        }
      }
    }
  }

  safari.self.tab.dispatchMessage("extractedFeeds", feeds);
}

function protocol(url) {
  return url.split(":")[0];
}

function typeFromString(string) {
  if (string.indexOf("rss") != -1) {
    return "RSS";
  } else if (string.indexOf("atom") != -1) {
    return "Atom";
  } else {
    return "Unknown";
  }
}

function titleFromType(type) {
  if (type.indexOf("rss") != -1) {
    return "RSS Feed";
  } else if (type.indexOf("atom") != -1) {
    return "Atom Feed";
  } else {
    return "Feed";
  }
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

function _getBaseUrl() {
  var head = document.getElementsByTagName("head")[0];
  var baseLinks = head.getElementsByTagName("base");
  var baseUrl;

  for (var i=0; i < baseLinks.length; i++) {
    var link = baseLinks[i];

    if (link.attributes.getNamedItem("href") !== null) {
      url = link.attributes.getNamedItem("href").value;

      if (url.charAt(url.length - 1) != "/") {
        url += "/";
      }

      baseUrl = url;
      break;
    }
  }

  if (baseUrl === undefined) {
    baseUrl = protocol(document.URL) + "://" + document.domain + "/"
  }

  return baseUrl;
}

function _fullUrl(url) {
  var trimmedUrl = url.trim();
  var protocol = trimmedUrl.substr(0,4);

  if (protocol !== "http" && protocol !== "feed") {
    if (trimmedUrl[0] == "/") {
      trimmedUrl = trimmedUrl.slice(1);
    }

    trimmedUrl = _getBaseUrl() + trimmedUrl;
  }

  return trimmedUrl;
}

if (window.top === window) {
  if (document.domain !== "undefined") {
    extractPageFeeds();
  }
}
