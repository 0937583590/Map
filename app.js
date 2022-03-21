myapp = Vue.createApp({
  data() {
    return {
      shopList: [],
      userLat: 0,
      userLon: 0,
      googleMap: Object,
      googleMarker: [],
      slicker: Object,
      nowDistance: 1,
      isInit: false,
      windowSize: 0,
      isHamburgerSelected: false,
    };
  },
  async mounted() {
    await this.getUserLocation().then((message) => {
      console.log(message);
    });
    await this.roadShopData();
    this.setMyMap();
    this.setMarker();
    this.setSlicker();
    this.addHamburger();
    this.resetOnrest();
    //this.settingFontSize();

    this.isInit = true;
    console.log("done!");
  },
  methods: {
    async roadShopData() {
      this.shopList = [];
      const requestOptions = {
        method: "POST",
        headers: { Encrypt: "[1]", "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: this.userLat,
          lon: this.userLon,
          distance: this.nowDistance,
        }),
      };
      await fetch(
        "https://smuat.megatime.com.tw/taiwanlottery/api/Home/Station/",
        requestOptions
      )
        .then((res) => {
          return res.json();
        })
        .then((result) => {
          let shopnum = 0;
          while (shopnum < result.content.list.length) {
            if (shopnum >= 250) {
              alert("附近超過250家投注站");
              break;
            }
            this.shopList.push(result.content.list[shopnum]);
            console.log("新增" + result.content.list[shopnum].name);
            console.log('123123')
            shopnum++;
          }
        });
    },
    getUserLocation() {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("定位中");
            let lat = position.coords.latitude;
            this.userLat = lat;
            let lon = position.coords.longitude;
            this.userLon = lon;
            console.log(this.userLat);
            console.log(this.userLon);
            resolve("定位成功");
          },
          (error) => {
            alert("ERROR(" + error.code + "): " + error.message);
            reject("定位失敗");
          }
        );
      });
    },
    resetOnrest() {
      this.windowSize=document.body.clientWidth;
      window.onresize = () => {
        this.windowSize = document.body.clientWidth;
      };
    },
    setMyMap() {
      let mapOption = {
        center: { lat: this.userLat, lng: this.userLon },
        gestureHandling: "greedy",
        zoom: 17,
        disableDefaultUI: true,
      };
      this.googleMap = new google.maps.Map(
        document.getElementById("map"),
        mapOption
      );
      this.addSelectDistance();
    },
    setMarker() {
      let index = 0;

      for (shop of this.shopList) {
        let marker = new google.maps.Marker({
          title: shop.name,
          index: index,
          position: new google.maps.LatLng(shop.lat, shop.lon),
          icon: {
            url: "unselectedIcon.png",
          },
          map: this.googleMap,
        });
        marker.addListener("click", () => {
          this.googleMap.setCenter(marker.getPosition());
          this.slicker.slick("slickGoTo", marker.index);
          this.googleMap.setZoom(19);
        });
        this.googleMarker.push(marker);
        console.log(marker.getIcon())
        index++;
      }
    },

    setSlicker() {
      this.slicker = $(".shoplist").slick({
        arrows: false,
        slidesToShow: 1,
        centerMode: true,
      });
      isInit = this.isInit;
      markerArray = this.googleMarker;
      thismap = this.googleMap;

      thismap.setCenter(
        markerArray[this.slicker.slick("slickCurrentSlide")].getPosition()
      );
      markerArray[this.slicker.slick("slickCurrentSlide")].setIcon({
        url: "selectedIcon.png",
      });
      if (!isInit) {
        this.slicker.on(
          "beforeChange",
          function (event, slick, currentSlide, nextSlide) {
            console.log(markerArray[nextSlide]);
            thismap.setCenter(markerArray[nextSlide].getPosition());
            markerArray[currentSlide].setIcon({
              url: "unselectedIcon.png",
            });
            markerArray[nextSlide].setIcon({
              url: "selectedIcon.png",
            });
          }
        );
      }
    },
    navigat(shopAddress) {
      window.open(
        "http://www.google.com/maps/dir/" +
          this.userLat +
          "," +
          this.userLon +
          "/" +
          shopAddress
      );
    },

    addSelectDistance() {
      const listDiv = document.createElement("div");
      const listBtn = document.createElement("button");
      listBtn.className = "btn dropdown-toggle";
      listBtn.type = "button";
      listBtn.id = "listBtn";
      listBtn.setAttribute("data-bs-toggle", "dropdown");
      listBtn.innerHTML = this.nowDistance + "公里";
      listDiv.appendChild(listBtn);
      const listUl = document.createElement("ul");
      listUl.className = "dropdown-menu";
      for (itemDistance of [1, 2, 5]) {
        let listItem = document.createElement("li");
        let ItemLink = document.createElement("a");
        ItemLink.className = "dropdown-item";
        ItemLink.href = "#";
        ItemLink.innerHTML = itemDistance + "公里";
        ItemLink.setAttribute("distance", itemDistance);
        ItemLink.addEventListener(
          "click",
          async (e) => {
           
            document.getElementById("listBtn").innerHTML = ItemLink.innerHTML;
            this.nowDistance = parseInt(e.target.getAttribute("distance"));
            console.log(e.target.getAttribute("distance"));
            this.slicker.slick("unslick");
            this.shopList = [];
            await this.roadShopData();
            console.log("reload done!");
            for (nullmarker of this.googleMarker) {
              nullmarker.setMap(null);
              console.log("清除" + nullmarker.title);
            }
            this.googleMarker = [];
            this.setMyMap();
            this.setMarker();
            this.setSlicker();
            this.resetFontsiz()
          },
          false
        );
        listItem.appendChild(ItemLink);
        listUl.appendChild(listItem);
      }
      listDiv.appendChild(listUl);
      //controlUI.appendChild(controlText);

      this.googleMap.controls[google.maps.ControlPosition.TOP_LEFT].push(
        listDiv
      );
    },
    resetFontsiz(){
      let infoboxs=document.querySelectorAll(".itemInfo")
      if (this.windowSize < 700) {
        for(infobox of infoboxs){
          infobox.style.fontSize="16px"
        }
      }
      else{
        for(infobox of infoboxs){
          infobox.style.fontSize="1.5vw"
        }
      }
    }
    ,
    addHamburger() {
      hamburger = document.getElementById("hamburger");
      boxlist = document.getElementById("outercontainer");
      hamburger.onclick = () => {
        if (!this.isHamburgerSelected) {
          hamburger.src = "selectedHanberger.png";
          this.isHamburgerSelected = !this.isHamburgerSelected;
          boxlist.classList.remove("unactive");

          boxlist.classList.add("active");
        } else {
          hamburger.src = "unselectedHanberger.png";
          this.isHamburgerSelected = !this.isHamburgerSelected;
          boxlist.classList.add("unactive");
          boxlist.classList.remove("active");
        }
      };
    },
  },
  watch: {
    windowSize() {
      this.resetFontsiz()
    },
  },
});

myapp.mount("#myApp");
