$(function () {
  //读取本地数据
  function getData() {
    var data = localStorage.getItem("storeUsers");
    if (data !== null) {
      return JSON.parse(data);
    } else {
      return [];
    }
  }
  //保存本地存储数据
  function saveData(data) {
    localStorage.setItem("storeUsers", JSON.stringify(data));
  }

  //获取删除的数据
  function getDeleted() {
    var data = localStorage.getItem("dels");
    if (data !== null) {
      return JSON.parse(data);
    } else {
      return [];
    }
  }

  //保存删除的数据
  function saveDeleted(data) {
    localStorage.setItem("dels", JSON.stringify(data));
  }

  //登陆注册
  RegAndLog();
  function RegAndLog() {
    var users = getData();
    var dels = getDeleted();
    var online = false;//标记在线状态；
    localStorage.removeItem("onlineUser");
    function Match(arr) {
      var onlineUser = JSON.parse(window.localStorage.getItem('onlineUser'));
      //遍历数据 i是索引,n是元素
      var res;
      $.each(arr, function (i, n) {
        if (onlineUser == n.name) {
          res = i;
          return false;
        }
      })
      return res;
    }
    var cnt = Match(users);
    var num = Match(dels);

    addItem();
    function addItem() {
      //创建新的li
      $('.input').on("keyup", function (e) {
        if ($(this).val() == '') {
          return false;
        }
        if (e.keyCode == 13) {
          if (!online) {
            showTips("请先登录 ！");
            $(this).val("");
            return false;
          }
          var users = getData();
          cnt = Match(users);
          var index;
          $.each(users, function (i, n) {
            if (onlineUser == n.name) {
              return i;
            }
          })
          $.each(users[cnt].todos, function (i, n) {
            if (n.priority == 0) {
              index = i;
              return false;
            }
          })
          var obj = {
            title: $(this).val(),
            completed: false,
            priority: 0
          };
          users[cnt].todos.splice(index, 0, obj);
          saveData(users);
          load();
          //每次都先把新的li添加到本地存储，再连同之前的小li一起渲染到页面上
          $(this).val("");
        }
      })
    }

    //渲染
    function load() {
      var users = getData();
      cnt = Match(users);
      $(".list").html("");
      var todoCount = users[cnt].todos.length;

      $.each(users[cnt].todos, function (i, n) {
        var li = $(''
          + '<li>'
          + ' <input type="checkbox" class="select"></input>'
          + ' <span class="mark"> </span>'
          + ' <div class="words">' + n.title + '</div>'
          + ' <span class="delete" id=' + i + '>x</span>'
          + ' <div class="funct">'
          + '   <span class="ellipsis">···</span>'
          + '   <ul class="sort">'
          + '     <li>优先级</li>'
          + '     <li class="senior">!!!</li>'
          + '     <li class="junior">!!</+li>'
          + '     <li class="common">!</li>'
          + '   </ul>'
          + ' </div>'
          + '</li>'
        );
        li.addClass("list_li");
        $(".list").append(li);

        if (users[cnt].todos[i].completed == true) {
          $(".words").eq(i).addClass("strickout");
          $(".words").eq(i).css("color", "rgb(163, 162, 162,0.4)");
          todoCount--;
          $(".select").eq(i).prop("checked", true);
        } else {
          $(".words").eq(i).removeClass("strickout");
          $(".words").eq(i).css("color", "#737373");
          $(".select").eq(i).prop("checked", false);
        }
        if (users[cnt].todos[i].priority == 2) {
          $(".mark").eq(i).text("!!!");
          $(".mark").eq(i).addClass("senior");
        }
        if (users[cnt].todos[i].priority == 1) {
          $(".mark").eq(i).text("!!");
          $(".mark").eq(i).addClass("junior");
        }
      })

      $(".list").fadeIn(800);
      saveData(users);
      showBox();
      editItem();
      showItem();
      showCount(todoCount);
      showdels();
    }

    //优先级设置
    sortItem();
    function sortItem() {
      $(".list").on("click", ".list_li", function (e) {
        //$(this)可以用来代替.list_li
        var target = $(e.target);
        var del = $(this).children(".delete");
        var index = del.attr("id");
        var users = getData();
        cnt = Match(users);
        if (target.hasClass("ellipsis")) {
          var sort = $(this).children(".sort");
          sort.show();
        } else if (target.hasClass("senior")) {
          users[cnt].todos[index].priority = 2;
          enqueue(users[cnt].todos[index]);
          load();
        } else if (target.hasClass("junior")) {
          users[cnt].todos[index].priority = 1;
          enqueue(users[cnt].todos[index]);
          load();
        } else if (target.hasClass("common")) {
          users[cnt].todos[index].priority = 0;
          enqueue(users[cnt].todos[index]);
          load();
        }
      })
    }

    function enqueue(element) {
      var users = getData();
      cnt = Match(users);
      var item = users[cnt].todos;
      var len = item.length;
      if (len == 0) {
        users[cnt].todos.push(element);
      } else {
        var index;
        $.each(item, function (i, n) {
          if (element.title == n.title) {
            index = i;
            return false;
          }
        })
        item.splice(index, 1);
        $.each(item, function (i, n) {
          if (element.priority > n.priority || element.priority == n.priority) {
            item.splice(i, 0, element);
            return false;
          }
        })
      }
      saveData(users);
    }



    //显示未完成数
    function showCount(count) {
      if (count > 0) {
        $(".active_count").text(count + " items left");
      } else {
        $(".active_count").text("0 item left");
      }
    }

    //放三个按钮的那一栏
    function showBox() {
      var users = getData();
      cnt = Match(users);
      if (users[cnt].todos.length == 0) {
        $(".footer").hide();
      } else {
        $(".footer").show();
      }
    }

    //删除和使li变为完成状态
    dealItem();
    function dealItem() {
      $(".list").on("click", ".list_li", function (e) {
        var target = $(e.target);
        var index;
        if (target.hasClass("delete")) {
          var users = getData();
          var deletedArr = getDeleted();
          var index = target.attr("id");
          //调用splice会改变原数组
          var deletedItem = users[cnt].todos.splice(index, 1);
          num = Match(dels);
          deletedArr[num].done.push(deletedItem[0]);
          saveDeleted(deletedArr);
          saveData(users);
          load();
        } else if (target.hasClass("select")) {
          var users = getData();
          var index = $(this).children(".delete").attr("id");
          users[cnt].todos[index].completed = !users[cnt].todos[index].completed;
          //全部都为true，则让全选按钮为true
          var flag = true;
          var selects = $(".list_li .select");
          $.each(selects,function (i,n) {
            if (!selects.eq(i).prop("checked")) {
              flag = false;
              $("#selectAll").prop("checked",false);
            }
          })
          if (flag == true) {
            $("#selectAll").prop("checked",true);
          }
          saveData(users);
          load();
        }
      })
    }

    //clear_completed的功能
    clearItem();
    function clearItem() {
      //全选按钮这里有毛病
      //气死我了啊啊啊啊啊

      $("#labelAll").on("click", function () {
        onlineUser = JSON.parse(window.localStorage.getItem('onlineUser'));
        if (onlineUser == null) {
          return false;
        }
        var users = getData();
        cnt = Match(users);
        $.each(users[cnt].todos, function (i, n) {
          n.completed = $("#selectAll").prop("checked") ? false : true;
        })
        saveData(users);
        load();
      })
      $(".clear_completed").on("click", function () {
        var users = getData();
        var dels = getDeleted();
        cnt = Match(users);
        num = Match(dels);
        if ($("#selectAll").prop("checked")) {
          dels[num].done = dels[num].done.concat(users[cnt].todos);
          saveDeleted(dels);
          users[cnt].todos = [];
          saveData(users);
          $("#selectAll").prop("checked", false);
          load();
        } else {
          //remove放着completed = true的元素
          var remove = users[cnt].todos.filter(function (item) {
            return item.completed == true;
          });
          dels[num].done = dels[num].done.concat(remove);
          saveDeleted(dels);
          users[cnt].todos = users[cnt].todos.filter(function (item) {
            return item.completed != true;
          });
          //还差删除的元素放到deleted
          saveData(users);
          load();
        }
      })
    }

    //编辑item
    editItem();
    function editItem() {
      $(".list").on("dblclick", ".list_li", function (e) {
        var target = $(e.target);
        var users = getData();
        if (target.hasClass("words")) {
          var index = $(this).children(".delete").attr("id");
          var oldhtml = target.html();
          if (oldhtml.indexOf('type="text"') > 0) {
            return;
          }
          var newobj = $("<input type='text'></input>");
          newobj.val(oldhtml);
          newobj.on("blur", function () {
            //当触发时判断新增元素值是否为空，为空则不修改，并返回原有值 
            if ($(this).val() && $(this).val().trim() !== "") {
              if ($(this).val() == oldhtml) {
                target.html(oldhtml);
              } else {
                target.html($(this).val());
              }
              users[cnt].todos[index].title = $(this).val();
            } else {
              target.html(oldhtml);
            }
            saveData(users);
          })
          target.html("");
          target.append(newobj);
          newobj.focus();
        }
      })
    }

    //回收站功能
    recycler();
    function recycler() {
      var lis = $("nav>ul>li");
      onlineUser = JSON.parse(window.localStorage.getItem('onlineUser'));
      lis.eq(0).on("mouseenter", function () {
        if (onlineUser == null) {
          return false;
        }
        $(".recycle").show();
      })
      lis.eq(0).on("mouseleave", function () {
        $(".recycle").hide();
      })

      var dels = getDeleted();
      num = Match(dels);
      $(".empty").on("click", function () {
        var dels = getDeleted();
        num = Match(dels);
        dels[num].done = [];
        saveDeleted(dels);
        showdels();
      })
      $(".list2").on("click", function (e) {
        var dels = getDeleted();
        var users = getData();
        cnt = Match(users);
        num = Match(dels);
        var target = $(e.target);
        //var item = target.parents()[0];
        var index;
        if (target.hasClass("restore")) {
          var txt = $("item>.log").text();
          $.each(dels[num].done, function (i, n) {
            n.priority = 0;
            if (txt == n.title) {
              index = i;
              return false;
            }
          })
          var which = dels[num].done.splice(index, 1);
          users[cnt].todos = users[cnt].todos.concat(which);
          saveData(users);
          load();
          saveDeleted(dels);
          showdels();
        }
      })
    }

    function showdels() {
      var dels = getDeleted();
      num = Match(dels);
      if (dels[num].done.length == 0) {
        var zone = $("<p>The recycle bin is empty.</p>");
        $(".list2").html("");
        $(".list2").append(zone);
        $(".empty").hide();
      } else {
        $(".list2").html("");
        $(".empty").show();
        //遍历数据 i是索引,n是元素
        $.each(dels[num].done, function (i, n) {
          var li = $(''
            + '<li>'
            + ' <div class="log">' + n.title + '</div>'
            + ' <span class="restore">restore</span>'
            + '</li>');
          $(".list2").append(li);
        })
        $(".list2").fadeIn(2000);
      }
    }

    //显示和隐藏所有/未完成/已完成/删除的li
    showItem();
    function showItem() {
      var btns = $(".btns_box").children();
      $(".all").on("click", function (e) {
        var target = $(e.target);
        var lis = $(".list").children(".list_li");
        lis.show();
        $.each(btns, function (i, n) {
          btns.eq(i).removeClass('selected');
        })
        target.addClass('selected');
      })
      $(".active").on("click", function (e) {
        var target = $(e.target);
        var lis = $(".list").children(".list_li");
        var users = getData();
        cnt = Match(users);
        var lis = $(".list").children(".list_li");
        $.each(users[cnt].todos, function (i, n) {
          if (n.completed == true) {
            lis.eq(i).hide();
          } else {
            lis.eq(i).show();
          }
        })
        saveData(users);
        $.each(btns, function (i, n) {
          btns.eq(i).removeClass('selected');
        })
        target.addClass('selected');
      })

      $(".completed").on("click", function (e) {
        var target = $(e.target);
        var lis = $(".list").children(".list_li");
        var users = getData();
        cnt = Match(users);
        var lis = $(".list").children(".list_li");
        $.each(users[cnt].todos, function (i, n) {
          if (n.completed == false) {
            lis.eq(i).hide();
          } else {
            lis.eq(i).show();
          }
        })
        saveData(users);
        $.each(btns, function (i, n) {
          btns.eq(i).removeClass('selected');
        })
        target.addClass('selected');
      })
    }

    //每次关闭都要清空
    function clearbox() {
      $('.a_register .name').val("");
      $('.a_login .name').val("");
      $('.a_register .pwd').val("");
      $('.a_login .pwd').val("");
    }
    //显示提示
    function showTips(tips) {
      $('.tip_box').show();
      $('.tip_box').text(tips);
      var timer = setTimeout(function () {
        $('.tip_box').hide();
        clearTimeout(timer);
      }, 1000);
    }
    //用户头部名
    $('.cur_name').on("click", function () {
      if (!online) {
        $(".a_login").show();
      }
    })
    $('.cur_name').on("mousemove", function () {
      if (online) {
        $(".personal").show();
        users = getData();
        cnt = Match(users);
        var len = users[cnt].todos.length;
        $(".total_count").text(len);
      }
    })
    $(".cur_name").on("mouseleave", function () {
      $(".personal").hide();
    })
    $(".withdraw").on("click", function (e) {
      online = false;
      localStorage.removeItem("onlineUser");
      //recycler();
      $(".footer").hide();
      $('.personal').hide();
      $(".person").text("未登录");
      $(".list").html("");
      e.stopPropagation();
    })
    $("#back").on("click", function () {
      $(".a_register").hide();
      $(".a_login").show();
      clearbox();
    })
    $('.to_register').on("click", function () {
      $(".a_register").show();
      $(".a_login").hide();
      clearbox();
    })
    $(".fade").each(function () {
      $(this).on('click', function () {
        $(".a_register").hide();
        $(".a_login").hide();
      })
    })
    //注册按钮
    var name, password;
    $(".a_register .btn").on("click", function () {
      var Reg1 = /^[\w\W]{1,15}$/;
      $.each(users, function (i, n) {
        if ($('.a_register .name').val() == n.name) {
          showTips("该账号已存在 !");
          return false;
        }
      })
      if (Reg1.test($('.a_register .name').val())) {
        name = $('.a_register .name').val();
      }
      var Reg2 = /^[\w!@#$%^&*(),.?]{6,18}$/;
      if (Reg2.test($('.a_register .pwd').val())) {
        password = $('.a_register .pwd').val();
      } else {
        showTips('密码格式不对 !');
        return false;
      }
      var obj = {
        name: name,
        password: password,
        todos: []
      }
      var bin = {
        name: name,
        done: []
      }
      users.push(obj);
      dels.push(bin);
      saveData(users);
      saveDeleted(dels);
      showTips('注册成功 !');
      $(".a_login").show();
    })

    //登陆按钮，以及后续的验证
    $(".a_login .btn").on("click", function () {
      //flag标记该用户是否已经注册
      var flag = false;
      var index = 0;
      name = $('.a_login .name').val();
      password = $('.a_login .pwd').val();
      $.each(users, function (i, n) {
        if (name == n.name) {
          flag = true;
          index = i;
        }
      })
      if (flag) {
        if (password == users[index].password) {
          //登陆后，将属于该用户的信息放入数组中；
          window.localStorage.setItem("onlineUser", JSON.stringify(name));
          onlineUser = JSON.parse(window.localStorage.getItem('onlineUser'));
          online = true;
          if (onlineUser) {
            //头部用户名显示
            $(".person").html(onlineUser + ",欢迎回来~");
          }
          $('.a_login').hide();
          $('.a_register').hide();
          clearbox();
          load();
        } else {
          showTips('密码错误 !');
        }
      } else {
        showTips('账号不存在或输入错误 !');
        return false;
      }
    })
  }
})