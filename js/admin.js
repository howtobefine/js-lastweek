console.clear();

// DOM
const orderBody = document.querySelector('.orderList');
const orderWrap = document.querySelector('.orderTableWrap');
const discardAllBtn = document.querySelector('.discardAllBtn');

const url = 'https://livejs-api.hexschool.io/api/livejs/v1/admin/howtobefine/orders';
const token = 'JTm13euhVufuzCISyBOb7aXIX123';
const headers = {
    headers: {
        Authorization: token
    }
};

let orderList = [];


// 初始化
getOrderList();

// 取得訂單列表

function getOrderList() {
    axios.get(url, headers)
        .then(res => {
            orderList = res.data.orders;
            renderOrderList(orderList);
        })
        .catch(err => console.log(err))
};

// 渲染訂單列表（修改狀態、刪除特定資料）
function renderOrderList(data) {
    if (data.length === 0) {
        orderWrap.innerHTML = `<p>沒有訂單資料</p>`;
        return;
    }

    let str = '';

    data.forEach(i => {
        let productStr = '';

        i.products.forEach(i => {
            productStr += `<p>${i.title}</p>`;
        });

        let time = new Date(parseInt(i.createdAt) * 1000).toLocaleString().replace(/:\d{1,2}$/, " ").replace(/\//g, "-");
        let date = time.split(' ').splice(0, 1).join('');

        let paid = i.paid ? '已處理' : '未處理';

        str += `<tr>
    <td>${i.id}</td>
    <td>
      <p>${i.user.name}</p>
      <p>${i.user.tel}</p>
    </td>
    <td>${i.user.address}</td>
    <td>${i.user.email}</td>
    <td>
      ${productStr}
    </td>
    <td>${date}</td>
    <td class="orderStatus">
      <a href="#" class="paid" data-id="${i.id}">${paid}</a>
    </td>
    <td>
      <input type="button" class="delSingleOrder-Btn" value="刪除" data-id="${i.id}"/>
    </td>
  </tr>`;
    })

    orderBody.innerHTML = str;
    renderC3();
};

orderBody.addEventListener('click', e => {
    e.preventDefault();

    let orderId = e.target.getAttribute('data-id');

    let isPaid = orderList[orderList.findIndex(i => i.id === orderId)].paid;
    let sendPaid = isPaid ? false : true;

    let data = {
        "data": {}
    };

    if (e.target.getAttribute('class') === 'paid') {
        data.data.id = orderId;
        data.data.paid = sendPaid;

        axios.put(url, data, headers)
            .then(res => {
                orderList = res.data.orders;
                renderOrderList(orderList);
                swal('訂單狀態已修改', '快去處理其他訂單吧', 'success');
            })
            .catch(err => console.log(err))
    };

    if (e.target.getAttribute('class') === 'delSingleOrder-Btn') {
        axios.delete(`${url}/${orderId}`, headers)
            .then(res => {
                orderList = res.data.orders;
                renderOrderList(orderList);
                swal('此筆訂單已被刪除', '快去處理其他訂單吧', 'success');
            })
            .catch(err => console.log(err))
    };
});

// 刪除全部訂單
discardAllBtn.addEventListener('click', e => {
    if (e.target.getAttribute('class') === 'discardAllBtn') {
        axios.delete(url, headers)
            .then(res => {
                orderList = res.data.orders;
                renderOrderList(orderList);
                swal('所有訂單都已清除', '是不是可以下班了', 'success');
            })
    };
});

// C3 圖表
function renderC3() {
    let obj = {};
    orderList.forEach(i => {
        i.products.forEach(i => obj[i.title] === undefined ? obj[i.title] = i.price * i.quantity : obj[i.title] += i.price * i.quantity);
    });

    // 排序
    let sortAry = Object.entries(obj).sort((a, b) => b[1] - a[1]);

    // 第四項之後的歸類為其他
    if (sortAry.length > 3) {
        let total = 0;
        sortAry.forEach((item, index) => {
            if (index > 2) {
                total += sortAry[index][1];
            }
        })
        sortAry.splice(3, sortAry.length - 1);
        sortAry.push(['其他', total]);
    };

    let chart = c3.generate({
        bindto: '#chart',
        data: {
            type: 'pie',
            columns: sortAry
        }
    });
};