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
      isInit:false
    };
  },
  async mounted() {
    await this.getUserLocation().then();
    await this.roadShopData();
    this.setMyMap();
    this.setMarker();
    this.setSlicker();
    this.isInit=true
    console.log("done!");
  },
  methods: {
    async roadShopData() {
      this.shopList=[]
      const requestOptions = {
        method: "POST",
        headers: { Encrypt: "[1]", "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: this.userLat,
          lon: this.userLon,
          distance: this.nowDistance,
        }),
      };
      var response = await fetch(
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
              alert("附近超過250家投注站")
              break;
            }
            this.shopList.push(result.content.list[shopnum]);
            console.log("新增"+result.content.list[shopnum].name);

            shopnum++;
          }
     
        });
    },
    async getUserLocation() {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            let lat = position.coords.latitude;
            this.userLat = lat;
            let lon = position.coords.longitude;
            this.userLon = lon;
            console.log(this.userLat);
            console.log(this.userLon);
            resolve();
          },
          (error) => {
            console.log("定位失敗");
            reject();
          }
        );
      });
    },
    setMyMap() {
      let mapOption = {
        center: { lat: this.userLat, lng: this.userLon },
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
            url: "/./image/unselectedIcon.png",
          },
          map: this.googleMap,
        });
        marker.addListener("click", () => {
          this.googleMap.setCenter(marker.getPosition());
          this.slicker.slick("slickGoTo", marker.index);
          this.googleMap.setZoom(19);
        });
        this.googleMarker.push(marker);

        index++;
      }
    },

    setSlicker() {
      this.slicker = $(".shoplist").slick({
        arrows: false,
        slidesToShow: 1,
        centerMode: true,
      });
      isInit=this.isInit
       markerArray = this.googleMarker;
       thismap = this.googleMap;

      thismap.setCenter(
        markerArray[this.slicker.slick("slickCurrentSlide")].getPosition()
      );
      markerArray[this.slicker.slick("slickCurrentSlide")].setIcon({
        url: "/./image/selectedIcon.png",
      });
      if(!isInit){
      this.slicker.on(
        "beforeChange",
        function (event, slick, currentSlide, nextSlide) {
          console.log(markerArray[nextSlide])
          thismap.setCenter(markerArray[nextSlide].getPosition());
          markerArray[currentSlide].setIcon({
            url: "/./image/unselectedIcon.png",
          });
          markerArray[nextSlide].setIcon({ url: "/./image/selectedIcon.png" });
        }
      );}
    },
    navigat() {
      var currentsite = this.slicker.slick("slickCurrentSlide");

      console.log(currentsite);
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

            // await (async function () {
            //   return new Promise();
            // })();
            this.slicker.slick("unslick");
            this.shopList=[]
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
  },
});

myapp.mount("#myApp");
