<template>
    <div style="display: -webkit-box;-webkit-box-orient: vertical;height: 100%;  box-sizing: border-box;">
        <div class="header">
            <div class="title">局域网杀手</div>
            <div class="buttons">
                <span @click="openInfo" class="mdi mdi-information-outline"></span>
                <span @click="setting" class="mdi mdi-settings-outline"></span>
                <span @click="min" class="mdi mdi-window-minimize"></span>
                <span @click="close" class="close mdi mdi-window-close"></span>
            </div>

            <div class="tab-buttons">
                <div class="tab-button" :class="{active:tab==0}" @click="tab=0">
                    <span class="icon mdi mdi-desktop-mac"></span>
                    <div class="text">主机列表</div>
                </div>
                <div class="tab-button" :class="{active:tab==1}" @click="tab=1">
                    <span class="icon mdi mdi-bookmark"></span>
                    <div class="text">备注信息</div>
                </div>
                <div class="tab-button" :class="{active:tab==2}" @click="tab=2">
                    <span class="icon mdi mdi-information-outline"></span>
                    <div class="text">网络信息</div>
                </div>
            </div>
        </div>
        <transition-group :name="'list'+(tabRight?'':'-l')" tag="div" style="display: -webkit-box;-webkit-box-orient: vertical;height: 100%;  box-sizing: border-box; -webkit-box-flex: 1">
            <div v-show="tab==0" :key="0" style="padding: 8px;display: -webkit-box;-webkit-box-orient: vertical;height: 100%;  box-sizing: border-box; -webkit-box-flex: 1">
                <el-form :inline="true" size="mini" class="input-bar" style="margin-top: 10px">
                    <el-form-item label="选择网络:">
                        <el-select placeholder="选择网络" v-model="interfaceIndex" :loading="loadingInterfaces" @change="interfaceChange">
                            <el-option v-for="(item,index) in interfaces" :key="index" :label="item.name" :value="index">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="scan">扫描</el-button>
                    </el-form-item>
                </el-form>
                <el-table ref="table" :data="online" highlight-current-row border size="mini" height="100%" row-class-name="tr-no-current" style="width: 100%;-webkit-box-flex: 1">
                    <el-table-column type="index" width="50">
                    </el-table-column>
                    <el-table-column property="ip" label="IP" sortable width="120">
                    </el-table-column>
                    <el-table-column property="mac" label="物理地址" sortable width="120">
                    </el-table-column>
                    <el-table-column label="备注">
                        <template slot-scope="scope">
                            <el-input size="mini" v-model="scope.row.remark" @change="remarkChange(scope.row)"></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column property="desc" label="描述">
                    </el-table-column>
                    <el-table-column label="操作" width="80">
                        <template slot-scope="scope">
                            <div v-if="interfaces[interfaceIndex].ip_address!=scope.row.ip">
                                <el-button size="mini" v-if="scope.row.cut" type="primary" @click="recover(scope.$index, scope.row)">恢复</el-button>
                                <el-button size="mini" v-if="!scope.row.cut" type="danger" @click="cut(scope.$index, scope.row)">断网</el-button>
                            </div>
                            <el-tag v-else type="success">本机</el-tag>
                        </template>
                    </el-table-column>
                </el-table>
                <el-progress :percentage="scanProcess" v-if="scanProcess>0&&scanProcess<100" :stroke-width="2" :show-text="false"></el-progress>
            </div>

            <div v-show="tab==1" :key="1" style="padding: 8px;display: -webkit-box;-webkit-box-orient: vertical;height: 100%;  box-sizing: border-box; -webkit-box-flex: 1">
                <el-table ref="table2" :data="remarkList" highlight-current-row border size="mini" height="100%" row-class-name="tr-no-current" style="width: 100%;-webkit-box-flex: 1">
                    <el-table-column type="index" width="50">
                    </el-table-column>
                    <el-table-column property="mac" label="物理地址" sortable width="120">
                    </el-table-column>
                    <el-table-column label="备注" property="remark">
                        <template slot-scope="scope">
                            <el-input size="mini" v-model="scope.row.remark" @change="remarkChange(scope.row,true)"></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="80">
                        <template slot-scope="scope">
                            <el-button size="mini" type="danger" @click="delRemark(scope.$index, scope.row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <div v-show="tab==2" :key="2" style="padding: 8px;display: -webkit-box;-webkit-box-orient: vertical;height: 100%;  box-sizing: border-box; -webkit-box-flex: 1">
                <el-form :inline="true" size="mini" class="input-bar" style="margin-top: 10px">
                    <el-form-item label="地址:">
                      <el-input v-model="address.addr" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="外网IP:">
                      <el-input v-model="address.publicIp" disabled></el-input>
                    </el-form-item>
                </el-form>
                <el-table ref="table3" :data="interfaces" highlight-current-row border size="mini" height="100%" row-class-name="tr-no-current" style="width: 100%;-webkit-box-flex: 1">
                    <el-table-column type="index" width="50">
                    </el-table-column>
                    <el-table-column property="name" label="名称" sortable>
                    </el-table-column>
                    <el-table-column property="ip_address" label="IP" width="120">
                    </el-table-column>
                    <el-table-column property="mac_address" label="物理地址" width="120">
                    </el-table-column>
                    <el-table-column property="netmask" label="子网掩码" width="120">
                    </el-table-column>
                </el-table>
            </div>
        </transition-group>

        <el-dialog title="关于" :visible.sync="infoDialogVisible" width="350" >
          <p>作者：leson</p>
          <p>邮箱：314087278@qq.com</p>
          <p>手机版：
            <a href="#" @click="openUrl('https://android.myapp.com/myapp/detail.htm?apkName=com.liyang.lankiller')">腾讯应用宝</a>&nbsp;&nbsp;
            <a href="#" @click="openUrl('http://app.mi.com/details?id=com.liyang.lankiller')">小米应用商店</a></p>
          <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="infoDialogVisible = false">确 定</el-button>
          </span>
        </el-dialog>
    </div>
</template>

<script>
var arp = require("node-arp");
var arpjs = require("@/arp/index.js");
var Cap = require("cap").Cap;
var os = require("os");
var axios=require("axios");
const publicIp = require('public-ip');

var ipcRenderer = require("electron").ipcRenderer;

export default {
  name: "MainPage",
  data() {
    return {
      infoDialogVisible:false,
      interfaceIndex: null,
      loadingInterfaces: true,
      interfaces: [],
      online: [],
      times: 100,
      tab: 0,
      tabRight: true,
      remarkList: [],
      //扫描第几个
      percentage: 0,
      address:{
        publicIp:"",
        addr:""
      }
    };
  },
  created() {
    var obj = this;
    this.loadingInterfaces = true;
    var list = this.loadInterfaces();
    obj.loadingInterfaces = false;
    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      if (item.ip_address && item.mac_address) {
        obj.interfaces.push(item);
      }
    }
    //console.log(list);
    /* list should be:
            [{
              name: 'eth0',
              ip_address: '10.0.1.3',
              mac_address: '56:e5:f9:e4:38:1d',
              type: 'Wired',
              netmask: '255.255.255.0',
              gateway_ip: '10.0.1.1'
             },
             { ... }, { ... }]
            */
    //console.dir(Cap.deviceList());
    this.loadRemarkList();
    this.getAddr();
  },
  computed: {
    /**
     * 扫描进度0-100
     */
    scanProcess() {
      return this.percentage / 254 * 100;
    }
  },
  watch: {
    /**
     * tab 更改
     */
    tab(oldVal, newVal) {
      //console.log(oldVal, newVal);
      this.tabRight = oldVal - newVal >= 0;
    }
  },
  methods: {

    openInfo(){
      this.infoDialogVisible=true
    },

    openUrl(url){
      require('electron').shell.openExternal(url)
    },
    /**
     * 关闭窗口
     */
    close() {
      ipcRenderer.send("window-closed");
    },
    /**
     * 最大窗口或恢复窗口
     */
    max() {
      this.maximum = ipcRenderer.sendSync("window-max");
    },
    /**
     * 最小化窗口
     */
    min() {
      ipcRenderer.send("window-min");
    },
    setting(){
      ipcRenderer.send("window-debtools");
    },
    /**
     * 获取网络
     */
    loadInterfaces() {
      var list = [];
      var array = os.networkInterfaces();
      for (var name in array) {
        //debugger;
        var item = array[name][1];
        if (item && !item.internal) {
          list.push({
            name: name,
            ip_address: item.address,
            mac_address: item.mac,
            netmask: item.netmask
          });
        }
      }
      return list;
    },
    /**
     * 选择网络，重新扫描该段网络
     */
    interfaceChange(index) {
      if (this.interfaceIndex == null) {
        return;
      }
      var net = this.interfaces[this.interfaceIndex];
      arpjs.setInterface(net.ip_address, net.mac_address);
      for (var i = 0; i < this.online.length; i++) {
        var item = this.online[i];
        if (item.cut) {
          this.recover(null, item);
        }
      }
      this.scan();
    },
    /**
     * 获取备注列表
     */
    loadRemarkList() {
      var list = [];
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        list.push({ mac: key, remark: localStorage.getItem(key) });
      }
      //console.log(list);
      this.remarkList = list;
    },
    /**
     * 扫描网段
     */
    scan() {
      //console.log("scan start...");
      if (this.interfaceIndex == null) {
        return;
      }
      var net = this.interfaces[this.interfaceIndex];
      this.online = [];
      var self = this;

      setTimeout(function() {
        try {
          self.findOnline(net);
        } catch (error) {
          console.log(error);
        }
        
      }, 10);
    },
    /**
     * 扫描网段在线主机
     */
    findOnline(net) {
      var self = this;
      var ip0 = net.ip_address.substring(
        0,
        net.ip_address.lastIndexOf(".") + 1
      );
      this.percentage = 0;
      for (var i = 1; i < 255; i++) {
        var ip = ip0 + i;
        try {
          this.findOne(ip, i);
        } catch (error) {
        }
        
      }
    },
    /**
     * 扫描某个ip
     */
    findOne(ip, i) {
      var self = this;
      setTimeout(function() {
        try {
           arp.getMAC(ip, function(err, mac) {
              try {
                  if (!err) {
                    var desc = self.getOui(mac);
                    self.online.push({
                      ip: ip,
                      mac: mac,
                      desc: desc,
                      cut: false,
                      remark: localStorage.getItem(mac)
                    });
                  }
              } catch (error) {}
          //console.log(err,mac);
          self.percentage++;
        });
        } catch (error) {
          console.log(error);
        }
       
      }, 2* i);
    },
    /**
     * 根据mac获取oui信息
     */
    getOui(mac) {
      var vendor
      try {
        var key=mac.replace(/:/g,"").substring(0,6).toUpperCase();
        vendor = oui[key];
      } catch (error) {
      }
      vendor = vendor ? vendor.split("\n")[0] : "unknown";
      return vendor;
    },
    /**
     * 断网恢复
     */
    recover(index, row) {
      if (row.cut) {
        row.cut = false;
        if (row._t) {
          clearInterval(row._t);
          row._t = null;
        }
      }
    },
    /**
     * 断网
     */
    cut(index, row) {
      if (!row.cut) {
        row.cut = true;
        var net = this.interfaces[this.interfaceIndex];
        var ip =
          net.ip_address.substring(0, net.ip_address.lastIndexOf(".") + 1) +
          "1";
        var t = setInterval(function() {
          arpjs.poison(ip, row.ip);
        }, this.times);
        row._t = t;
      }
    },
    /**
     * 备注更改
     */
    remarkChange(raw, bool) {
      localStorage.setItem(raw.mac, raw.remark);
      if (bool) {
        for (var i = 0; i < this.online.length; i++) {
          var item = this.online[i];
          if (item.mac == raw.mac) {
            this.online[i].remark = raw.remark;
            break;
          }
        }
      } else {
        this.loadRemarkList();
      }
    },
    /**
     * 删除备注
     */
    delRemark(index, row) {
      this.remarkList.splice(index, 1);
      localStorage.removeItem(row.mac, row.remark);
      for (var i = 0; i < this.online.length; i++) {
        var item = this.online[i];
        if (item.mac == row.mac) {
          this.online[i].remark = "";
          break;
        }
      }
    },
    getAddr(){
        var self=this;
        axios.get("https://forge.speedtest.cn/api/location/info")
        .then(function (response) {
          console.log(response);
          self.address.addr=response.data.country+response.data.province+response.data.city;
          self.address.publicIp=response.data.ip;
        });
        // publicIp.v4().then(ip => {
        //   console.log(ip);
        //   //=> '46.5.21.123'
        //   self.address.publicIp=ip;
        // });
    }
  }
};
</script>

<style>
.header {
  height: 110px;
  background-color: #297ed6;
  color: white;
  -webkit-app-region: drag;
  font-family: Microsoft JhengHei;
}
.header > div.title {
  float: left;
  padding: 0px 8px;
  height: 24px;
  line-height: 24px;
  font-size: 14px;
  color: #fff;
}
.header > div.buttons {
  float: right;
  font-size: 0px;
  -webkit-app-region: no-drag;
}

.header > div.buttons > span {
  display: inline-block;
  width: 32px;
  height: 24px;
  text-align: center;
  line-height: 24px;
  font-size: 14px;
  cursor: pointer;
}
.header > div.buttons > span:hover {
  background-color: rgba(0, 0, 0, 0.11);
}
.header > div.buttons > span.close:hover {
  background-color: rgba(255, 64, 64, 0.82);
}

.header > div.tab-buttons {
  margin-top: 25px;
  -webkit-app-region: no-drag;
  padding: 0px 10px;
  position: absolute;
}
.header > div.tab-buttons .tab-button {
  width: 80px;
  box-sizing: content-box;
  padding: 10px 10px;
  float: left;
  cursor: pointer;
  text-align: center;
  margin-right: 10px;
  -webkit-app-region: no-drag;
}
.header div.tab-buttons .tab-button .icon {
  font-size: 36px;
  transition: all 0.2s ease-in-out;
}
.header div.tab-buttons .tab-button .text {
  font-size: 12px;
}
.header div.tab-buttons .tab-button:hover,
.header div.tab-buttons .tab-button.active {
  background-image: linear-gradient(
    rgba(0, 0, 0, 0),
    rgba(0, 0, 0, 0.05),
    rgba(0, 0, 0, 0.09)
  );
}
.header div.tab-buttons .tab-button.active {
  border-bottom: 1px solid #fff;
}
.header div.tab-buttons .tab-button:hover .icon,
.header div.tab-buttons .tab-button.active .icon {
  text-shadow: 0px 0px 20px rgba(255, 255, 255, 0.55);
}

button:focus {
  outline: none;
  box-shadow: none !important;
}
.layout-hide-text .layout-text {
  display: none;
}
.el-table__row .el-input__inner {
  padding: 0px 10px;
}
.tr-no-current:not(.current-row) .el-input__inner {
  border-color: transparent;
  background-color: transparent;
  padding: 0px;
}
.list-enter-active,
.list-leave-active {
  transition: all 0.6s ease-in-out;
  position: absolute;
  width: 100%;
}
.list-enter {
  opacity: 0;
  transform: translateX(100%);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.list-l-enter-active,
.list-l-leave-active {
  transition: all 0.6s ease-in-out;
  position: absolute;
  width: 100%;
}
.list-l-enter {
  opacity: 0;
  transform: translateX(-100%);
}
.list-l-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>