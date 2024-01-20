/*
  MyLearning script
  Version: 1.0.23
*/

window.MyLearning = {
  pages_read_count: 0,
  total_pages_count: 0,
  user_progress_collected: false,
  _version: null,
  _w3sBaseUrl: 'https://www.w3schools.com',
  _profileBaseUrl: 'https://profile.w3schools.com',
  _linkTargetAttr: '',
  _myLearningBaseUrl: 'https://my-learning.w3schools.com'
};

MyLearning._isDebugMode = function () {
  return Util.isDebugMode('MyLearning');
}

MyLearning._logDebug = function (message, data, logRawData) {
  return Util.logDebug('MyLearning', message, data, logRawData);
}

MyLearning._logError = function (message, data, logRawData) {
  return Util.logError('MyLearning', message, data, logRawData);
}

MyLearning._cacheVersion = function () {
  // return cached result
  if (this._version !== null) {
    this._logDebug('version: ', this._version);
    return this._version;
  }

  this._version = Cookies.get('MyLearning.version')

  // fallback to v3
  if (typeof this._version === 'undefined' || !this._version) {
    this._version = '3';
  }

  this._logDebug('version: ', this._version);
  return this._version;
}

MyLearning._version_to_base_url_map = {
  '1': 'https://mypage.w3schools.com',
  '1.5': 'https://my-learning.w3schools.com',
  '1.5L': 'https://my-learning-legacy.w3schools.com',
  '2': 'https://myl-api.w3schools.com',
  '2.1': 'https://myl-api.w3schools.com',
  '3': 'https://myl-api.w3schools.com',
  '3-dev': 'https://my-learning.w3schools.com'
}

MyLearning._version_and_name_to_rel_url_map = {
  '1': {
    'api.meta': '/mypage/beta.php',
    'api.meta_for_default': '/mypage/beta_for_default.php',
    'api.exercise.get': '/mypage/get_exercise_obj2.php',
    'api.exercise.set': '/mypage/set_exercise_obj.php',
    'api.quiz.set_score': '/mypage/set_quiz_score2.php'
  },
  '1.5': {
    'api.meta': '/api/meta/',
    'api.meta_for_default': '/api/meta-for-default/',
    'api.exercise.get': '/api/exercise/get/',
    'api.exercise.set': '/api/exercise/set/',
    'api.quiz.set_score': '/api/quiz/set-score/'
  },
  '1.5L': {
    'api.meta': '/api/meta/',
    'api.meta_for_default': '/api/meta-for-default/',
    'api.exercise.get': '/api/exercise/get/',
    'api.exercise.set': '/api/exercise/set/',
    'api.quiz.set_score': '/api/quiz/set-score/'
  },
  '2': {
    'api.meta': '/api/classic/get-set-topic-progress',
    // 'api.meta_for_default': '/api/meta-for-default/', // deprecated
    'api.exercise.get': '/api/classic/get-exercises-progress',
    'api.exercise.set': '/api/classic/set-exercises-progress',
    'api.quiz.set_score': '/api/classic/set-quiz-progress'
  },
  '2.1': {
    'api.meta': '/api/classic/get-set-topic-progress',
    'api.exercise.get': '/api/classic/get-exercises-progress',
    'api.exercise.set': '/api/classic/set-exercises-progress',
    'api.quiz.set_score': '/api/classic/set-quiz-progress'
  },
  '3': {
    'api.meta': '/api/classic/get-set-topic-progress',
    'api.exercise.get': '/api/classic/get-exercises-progress',
    'api.exercise.set': '/api/classic/set-exercises-progress',
    'api.quiz.set_score': '/api/classic/set-quiz-progress'
  },
  '3-dev': {
    'api.meta': '/api/classic/get-set-topic-progress',
    'api.exercise.get': '/api/classic/get-exercises-progress',
    'api.exercise.set': '/api/classic/set-exercises-progress',
    'api.quiz.set_score': '/api/classic/set-quiz-progress'
  }
}

// usage:
// MyLearning.getUrl('api.quiz.set_score') -> https://mypage.w3schools.com/mypage/set_quiz_score2.php
MyLearning.getUrl = function (api_name, version) {
  this._logDebug('getUrl: ', api_name);

  if (typeof version === 'undefined') {
    this._cacheVersion();

    version = this._version;
  }

  if (this._isDebugMode()) {
    if (typeof this._version_to_base_url_map[version] === 'undefined') {
      console.warn('MyLearning -> Version is not valid. version: ', version);

      return '/';
    }

    if (typeof this._version_and_name_to_rel_url_map[version][api_name] === 'undefined') {
      console.warn('MyLearning -> Api name is not valid. version, api_name: ', version, api_name);

      return '/';
    }
  }

  return this._version_to_base_url_map[version] + this._version_and_name_to_rel_url_map[version][api_name];
}
// << classic

// < common

MyLearning.makePostRequest = function (url, data, callback) {
  Util.fetch({
    context: 'MyLearning -> makePostRequest',
    method: 'POST',
    url: url,
    data: data,
    callback: callback,
    withUserSession: true,
    handleUserSessionRedirection: true, // TODO: (mid) revisit this flag
    prepareResponseData: false,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};

MyLearning.elmIsInViewport = function (x) {
  var rect = x.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
    rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
  );
}

MyLearning.elmIsAboveViewport = function (x) {
  var rect = x.getBoundingClientRect();
  if (rect.top < 0) return true;
  return false;
}

MyLearning.getCircleMeta = function (xx, yy, r, aD) {
  var aR = (aD - 90) * Math.PI / 180.0;
  return {
    x: xx + (r * Math.cos(aR)),
    y: yy + (r * Math.sin(aR))
  };
}

MyLearning.getProfileIconCirclesRendered = function (x, y, r, sa, ea) {
  var s = MyLearning.getCircleMeta(x, y, r, ea);
  var e = MyLearning.getCircleMeta(x, y, r, sa);
  var f = ea - sa <= 180 ? "0" : "1";
  return ["M", s.x, s.y, "A", r, r, 0, f, 0, e.x, e.y].join(" ");
}

MyLearning.loadUser = function (context, callback) {
  this._logDebug('loadUser -> args: ', [context]);


  UserSession.processUserSession({
    context: context + ' -> MyLearning -> loadUser',
    handleRedirection: true,
    callback: function (userSessionVerificationRes) {
      if (context === 'footer') {
        MyLearning._footerLoadUser();
      }

      if (!TopNavBar.configured) {
        TopNavBar.postInitConfig({
          env: 'classic',
          loggedIn: UserSession.loggedIn === true,
          subscriptionPlan: UserSession.getUserSubscriptionPlan(),
          location: window.location
        });
      }

      if (UserSession.loggedIn === true) {
        Util.attachScript({
          id: 'pathfinder-script',
          path: '/lib/pathfinder/main.js',
          globalEntityName: 'Pathfinder',
          onLoadCallback: function (res) {
            if (res.error.code === '0') {
              Pathfinder.init();
            } else {
              console.error('Failed loading pathfinder util -> error: ', res.error);
            }
          }
        });
      }

      if (typeof callback !== 'undefined') {
        callback(userSessionVerificationRes);
      }
    }
  });
}

MyLearning.getStrWithPrefixRemoved = function (str, subStr) {
  const extractedChunk = str.slice(0, subStr.length);

  if (extractedChunk === subStr) {
    return str.slice(subStr.length);
  }

  return str;
}
// > common

// < footer
MyLearning._footerLoadUser = function () { // on lessons this is the first request, on quiz the only one
  this._logDebug('_footerLoadUser');

  if (!UserSession.loggedIn) {
    return;
  }

  var urlPath = window.location.pathname,
    urlPathWlo = this.getStrWithPrefixRemoved(urlPath, '/'), // wlo - without leading slash
    isQuizPage = false;

  if (urlPathWlo.indexOf('quiztest/quiztest') === 0) {
    isQuizPage = true;

    var pathMetaStr = sessionStorage.getItem(urlPath);

    if (pathMetaStr !== null) {
      var pathMeta = JSON.parse(pathMetaStr);

      if (pathMeta.isQuizPage) {
        this.renderUserProgress(pathMeta.reqRes.type, pathMeta.reqRes.raw);
        return;
      }
    }
  }

  // show the user active session first and update the progress when we have it on hands
  this.renderUserProgress('T', 'T{"a":0,"b":0}'); // T - unused state, stands for "Temporary/Transitory"

  var x, y, pos, foldername, filename, typ, cc, pathname = window.location.pathname;
  if (pathname.substr(0, 1) == "/") { pathname = pathname.substr(1); }
  pos = pathname.indexOf("/");
  foldername = pathname.substr(0, pos);
  if (pathname.indexOf("pandas") > -1) { foldername = "python/pandas"; }
  if (pathname.indexOf("numpy") > -1) { foldername = "python/numpy"; }
  if (pathname.indexOf("scipy") > -1) { foldername = "python/scipy"; }
  filename = pathname.substr(pos + 1);
  typ = foldername;
  if (foldername == "quiztest") {
    cc = window.location.href;
    pos = cc.indexOf("qtest=");
    typ = cc.substr(pos + 6);
  }

  var reqDataStr = "a=" + foldername + "&b=" + filename + "&c=" + typ + "&d=0&p=" + encodeURIComponent(window.location.pathname);

  MyLearning.makePostRequest(
    MyLearning.getUrl('api.meta'),
    reqDataStr,
    function (reqRes) {
      if (
        reqRes.error.code === '0'
        && reqRes.status === 200
      ) {
        var y = reqRes.dataStr;
        var x = y.substr(0, 1);

        MyLearning._logDebug('_footerLoadUser -> req_res -> x: ', x);

        if (x == "F" || x == "G" || x == "H" || x == "I" || x == "J" || x == "K" || x == "L" || x == "M" || x == "Q") {
          MyLearning.user_progress_collected = true;
          MyLearning.renderUserProgress(x, y); // this one sets the scroll event

          if (isQuizPage) {
            sessionStorage.setItem(urlPath, JSON.stringify({
              'isQuizPage': true,
              'reqRes': {
                'type': x,
                'raw': y
              }
            }));
          }
        }
      }
    }
  );
}

MyLearning.checkIfGotToTheBottomOfThePage = function () {
  var a = document.querySelector('.user-profile-bottom-wrapper');

  var elm_in_or_above_viewport = MyLearning.elmIsInViewport(a) || MyLearning.elmIsAboveViewport(a);
  // this._logDebug('checkIfGotToTheBottomOfThePage: ', elm_in_or_above_viewport);

  if (elm_in_or_above_viewport) {
    MyLearning._logDebug('checkIfGotToTheBottomOfThePage: ', true);

    window.removeEventListener("scroll", MyLearning.checkIfGotToTheBottomOfThePage);
    MyLearning.finishedPage();
  }
}

MyLearning._findInnerElements = function (parentElement, queryStr, callback) {
  var output = [];

  var hasCallback = typeof callback !== 'undefined';

  var elements = parentElement.querySelectorAll(queryStr);

  for (var index = 0; index < elements.length; index++) {
    output.push(elements[index]);

    if (hasCallback) {
      callback(elements[index], index);
    }
  }

  return output;
};

MyLearning._loopArray = function (arr, callback) {
  for (var index = 0; index < arr.length; index++) {
    callback(arr[index], index);
  }
};

MyLearning.renderUserProgress = function (cc, obj) {
  this._logDebug('renderUserProgress -> args: ', [cc, obj]);

  var x,
    degrees = 0,
    // color1,
    // color2,
    jsonobj;

  if (document.getElementById("top-nav-bar")) {
    if (cc == "I" || cc == "J" || cc == "H" || cc == "G" || cc == "O" || cc == "Q") {
      jsonobj = JSON.parse(obj.substr(1));
      this.pages_read_count = jsonobj.b;
      this.total_pages_count = jsonobj.a;
      x = Math.round((this.pages_read_count / this.total_pages_count) * 100);
      degrees = x * 3.6;
      if (degrees > 359) degrees = 359.99;
    }

    // if (cc == "Q") {
    //   color1 = "rgba(44, 156, 202, 0.1)";
    //   color2 = "rgba(44, 156, 202, 1)";
    // } else {
    //   color1 = "rgba(4, 170, 109, 0.1)";
    //   color2 = "rgba(4, 170, 109, 1)";
    // }

    if (cc == "J" || cc == "H" || cc == "G") {
      window.addEventListener("scroll", this.checkIfGotToTheBottomOfThePage);
      this.checkIfGotToTheBottomOfThePage();
    }

    // MyLearning._findInnerElements(document, '.user-progress-circle1', function (userProgressCircle1Elm) {
    //   if (cc == "Q") {
    //     userProgressCircle1Elm.setAttribute("stroke", "rgba(44, 156, 202, 0.1)");
    //   } else {
    //     userProgressCircle1Elm.setAttribute("stroke", "rgba(4, 170, 109, 0.1)");
    //   }

    //   // if (cc != "L" && cc != "F") {
    //   //   userProgressCircle1Elm.setAttribute("d", MyLearning.getProfileIconCirclesRendered(26, 35, 20, 0, 359.99));
    //   // }
    // });

    MyLearning._findInnerElements(document, '.user-progress-circle2', function (userProgressCircle2Elm) {
      // if (cc == "Q") {
      //   userProgressCircle2Elm.setAttribute("stroke", "rgba(44, 156, 202, 1)");
      // } else {
      //   userProgressCircle2Elm.setAttribute("stroke", "rgba(4, 170, 109, 1)");
      // }

      if (cc != "L" && cc != "F") {
        userProgressCircle2Elm.setAttribute("d", MyLearning.getProfileIconCirclesRendered(26, 35, 20, 0, degrees));
      }
    });

    if (cc == "Q") {
      if (degrees == 359.99) {
        MyLearning._findInnerElements(document, '.user-progress-star', function (userProgressStarElm) {
          userProgressStarElm.classList.add("up-active");
        });
      }
    }
  }

  // ga('send', 'event', 'user', 'login');
}

MyLearning.finishedPage = function () {
  this._logDebug('finishedPage');

  if (!UserSession.loggedIn || !this.user_progress_collected) {
    this._logDebug('finishedPage -> jumping out');
    return;
  }

  var x, y, pos, foldername, filename, typ, pathname = window.location.pathname;
  if (pathname.substr(0, 1) == "/") { pathname = pathname.substr(1); }
  pos = pathname.indexOf("/");
  foldername = pathname.substr(0, pos);
  if (pathname.indexOf("pandas") > -1) { foldername = "python/pandas"; }
  if (pathname.indexOf("numpy") > -1) { foldername = "python/numpy"; }
  if (pathname.indexOf("scipy") > -1) { foldername = "python/scipy"; }
  filename = pathname.substr(pos + 1);
  typ = foldername;

  var reqDataStr = "a=" + foldername + "&b=" + filename + "&c=" + typ + "&d=1&p=" + encodeURIComponent(window.location.pathname);

  MyLearning.makePostRequest(
    MyLearning.getUrl('api.meta'),
    reqDataStr,
    function (reqRes) {
      if (
        reqRes.error.code === '0'
        && reqRes.status === 200
      ) {
        var y = reqRes.dataStr;
        var x = y.substr(0, 1);

        if (x == "O") {
          MyLearning.registerPointForFinishedPage(x);
        }
      }
    }
  );
}

MyLearning.registerPointForFinishedPage = function () {
  MyLearning._logDebug('registerPointForFinishedPage');

  if (document.getElementById("top-nav-bar")) {
    this.pages_read_count++;

    MyLearning.renderProgress((this.pages_read_count / this.total_pages_count) * 100, true);
  }
}

MyLearning.renderProgress = function (percentPoints, isSinglePoint) {
  MyLearning._logDebug('renderProgress -> percentPoints: ', percentPoints);

  if (typeof isSinglePoint === 'undefined') {
    isSinglePoint = false;
  }

  var degrees = 0,
    completed = false;

  degrees = Math.round(percentPoints) * 3.6;

  if (degrees > 359) {
    degrees = 359.99;
    completed = true;
  };

  MyLearning._findInnerElements(document, '.user-progress-circle2', function (userProgressCircle2Elm) {
    userProgressCircle2Elm.setAttribute('d', MyLearning.getProfileIconCirclesRendered(26, 35, 20, 0, degrees));
  });

  if (completed) {
    MyLearning._findInnerElements(document, '.user-progress-star', function (userProgressStarElm) {
      userProgressStarElm.classList.add('up-active');
    });
  } else {
    if (isSinglePoint) {
      MyLearning._findInnerElements(document, '.user-progress-point', function (userProgressPointElm) {
        userProgressPointElm.classList.add('up-active');
      });
    }
  }
}

MyLearning.removeFooterProfileBtn = function () {
  document.getElementById('user-profile-bottom-wrapper').remove();
}

MyLearning.showQuizScoreProfileBtn = function () {
  document.getElementById('user-profile-quiz-score-wrapper').classList.remove('w3-hide');
}
// > footer
// >> classic