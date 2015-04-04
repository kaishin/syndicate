function extractPageFeeds() {
  var feeds = {};
  feeds["site"] = getBaseURL();
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
            feeds["list"].push({url: fullURL(href), title: titleFromType(typeValue), type: typeFromString(typeValue)});
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

function getBaseURL() {
  var head = document.getElementsByTagName("head")[0];
  var baseLinks = head.getElementsByTagName("base");
  var baseURL;

  for (var i=0; i < baseLinks.length; i++) {
    var link = baseLinks[i];

    if (link.attributes.getNamedItem("href") !== null) {
      url = link.attributes.getNamedItem("href").value;

      if (url.charAt(url.length - 1) != "/") {
        url += "/";
      }

      baseURL = url;
      break;
    }
  }

  if (baseURL === undefined) {
    baseURL = protocol(document.URL) + "://" + document.domain + "/"
  }

  return baseURL;
}

function fullURL(url) {
  var trimmedURL = url.trim();
  var protocol = trimmedURL.substr(0,4);

  if (protocol !== "http" && protocol !== "feed") {
    if (trimmedURL[0] == "/") {
      trimmedURL = trimmedURL.slice(1);
    }

    trimmedURL = getBaseURL() + trimmedURL;
  }

  return trimmedURL;
}

function populatePopover() {
  var popover = safari.extension.popovers[0];
  popover.width = 300;

  popover.height = 100;
}

if (window.top === window) {
  if (document.domain !== "undefined") {
    extractPageFeeds();
  }
}
