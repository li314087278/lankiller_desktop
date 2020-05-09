var Cap = require('cap').Cap;

function macToArr (macAddr) {
  var macArr = macAddr.split(':')
  var x
  for (x in macArr) {
    macArr[x] = '0x' + macArr[x]
  }
  return macArr
}

function ipToArr (ipAddr) {
  var ipArr = ipAddr.split('.')
  var x
  for (x in ipArr) {
    ipArr[x] = ipArr[x]
  }
  return ipArr
}

var interfaceSet = false

var c = new Cap();
var ip="";
var mac="";


var setInterface = function (_ip,_mac) {
  ip=_ip;
  mac=_mac;
  
  try {
      var device = Cap.findDevice(ip);
      var filter = 'arp';
      var bufSize = 10 * 1024 * 1024;
      var buffer = Buffer.alloc(65535);
      var linkType = c.open(device, filter, bufSize, buffer);
      interfaceSet = true
  } catch (e) {
    console.warn(e)
  }
  return
}

var send = function (pktObj) {
  if (!interfaceSet) {
    try {
        setInterface(_ip);
    } catch (e) {
        console.warn(e)
    }
    interfaceSet = true
  }
  if(!interfaceSet){
    return;
  }
  // Get the system MAC Address
    var myIp =ip;
    var pkt = {}
    pkt.dst = macToArr('ff:ff:ff:ff:ff:ff')
    pkt.src = macToArr(mac)
    pkt.ether_type = [0x08, 0x06]

    pkt.hw_type = [0x00, 0x01]
    if (pktObj.hasOwnProperty('hw_type')) { pkt.hw_type = pktObj.hw_type }
    pkt.proto_type = [0x08, 0x00]
    if (pktObj.hasOwnProperty('proto_type')) {
      pkt.proto_type = pktObj.proto_type
    }
    pkt.hw_len = [0x06]
    if (pktObj.hasOwnProperty('hw_len')) {
      pkt.hw_len = pktObj.hw_len
    }
    pkt.proto_len = [0x04]
    if (pktObj.hasOwnProperty('proto_len')) {
      pkt.proto_len = pktObj.proto_len
    }

    // REQUEST-0x01, REPLY-0x02
    pkt.op = [0x00, 0x01]
    if (pktObj.hasOwnProperty('op')) {
      if (pktObj.op.toLowerCase() === 'request') { pkt.op = [0x00, 0x01] }
      if (pktObj.op.toLowerCase() === 'reply') {
        pkt.op = [0x00, 0x02]
      }
    }

    pkt.src_mac = macToArr(mac)
    if (pktObj.hasOwnProperty('src_mac')) { pkt.src_mac = macToArr(pktObj.src_mac) }
    pkt.src_ip = ipToArr(myIp)
    if (pktObj.hasOwnProperty('src_ip')) {
      pkt.src_ip = ipToArr(pktObj.src_ip)
    }
    pkt.dst_mac = macToArr('00:00:00:00:00:00')
    if (pktObj.hasOwnProperty('dst_mac')) {
      pkt.dst_mac = macToArr(pktObj.dst_mac)
    }
    pkt.dst_ip = ipToArr('192.168.100.2')
    if (pktObj.hasOwnProperty('dst_ip')) {
      pkt.dst_ip = ipToArr(pktObj.dst_ip)
    }

    var x
    var pktArr = []
    for (x in pkt) {
      pktArr = pktArr.concat(pkt[x])
    }

    var arpRequest = new Buffer(pktArr)
    try {
      c.send(arpRequest, arpRequest.length);
    } catch (error) {
      console.log(error);
    }
    
}

exports.send = send
exports.setInterface = setInterface

process.on('error', function (e) {
  console.log("arp:");
  console.log(e)
})
