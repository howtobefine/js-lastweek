console.clear();

// DOM
const productWrap = document.querySelector('.productWrap');
const productSelect = document.querySelector('.productSelect');
const shoppingCart = document.querySelector('.shoppingCart-table');

const customerName = document.querySelector('#customerName');
const customerPhone = document.querySelector('#customerPhone');
const customerEmail = document.querySelector('#customerEmail');
const customerAddress = document.querySelector('#customerAddress');
const tradeWay = document.querySelector('#tradeWay');

const send = document.querySelector('.orderInfo-btn');
const form = document.querySelector(".orderInfo-form");

const inputs = document.querySelectorAll('input[type=text],input[type=tel],input[type=email]');
const constraints = {
    姓名: {
        presence: {
            message: '是必填欄位'
        }
    },
    電話: {
        presence: {
            message: '是必填欄位'
        },
        format: {
            pattern: /^[09]{2}\d{8}$/,
            message: '電話為 09 開頭，共 10 碼'
        }
    },
    Email: {
        presence: {
            message: '是必填欄位'
        }
    },
    寄送地址: {
        presence: {
            message: '是必填欄位'
        }
    },
    交易方式: {
        presence: {
            message: '是必填欄位'
        }
    }
};

// 表單驗證
function orderInput() {
    inputs.forEach(i => {
        i.addEventListener('change', e => {
            i.nextElementSibling.textContent = '';
            const errors = validate(form, constraints);
            if (errors) {
                renderErrors(errors);
            }
        })
    })
};

function renderErrors(errors) {
    if (errors !== undefined) {
        Object.keys(errors).forEach(i => {
            document.querySelector(`[data-message=${i}]`).textContent = errors[i];
        });
    };
};

const url = 'https://livejs-api.hexschool.io/api/livejs/v1/customer';
const api_path = 'howtobefine';

let productCard = [];
let cartData = [];

init();


// 取得產品資料
function getProductList() {
    axios.get(`${url}/${api_path}/products`)
        .then(res => {
            productData = res.data.products;
            renderData(productData);
        })
        .catch(err => {
            console.log(err.response.data);
        })
};

// 取得購物車資料
function getCartList() {
    axios.get(`${url}/${api_path}/carts`)
        .then(res => {
            cartData = res.data.carts;
            renderCart(cartData);
        })
        .catch(err => {
            console.log(err.response);
        })
};

// 渲染產品資料
function renderData(data) {
    let str = '';
    data.forEach(i => {
        str += `<li class="productCard">
        <h4 class="productType">新品</h4>
        <img
          src="${i.images}"
          alt="商品"
        />
        <a href="###" class="addCardBtn" data-id="${i.id}">加入購物車</a>
        <h3>${i.title}</h3>
        <del class="originPrice">NT$${(i.origin_price).toLocaleString()}</del>
        <p class="nowPrice">NT$${(i.price).toLocaleString()}</p>
      </li>`
    });
    productWrap.innerHTML = str;
};

// 篩選品項功能
productSelect.addEventListener('change', e => {
    let value = e.target.value;
    let newData = productData.filter(i => i.category === value);
    value === '全部' ? renderData(productData) : renderData(newData);
});

// 渲染購物車資料
function renderCart(data) {
    if (data.length === 0) {
        shoppingCart.innerHTML = `<tr><td>購物車內已經沒有商品了 RRR ((((；゜Д゜)))</td></tr>`;
        return;
    };

    let productStr = '';
    let total = 0;
    data.forEach(i => {
        productStr += `<tr>
        <td>
          <div class="cardItem-title">
            <img src="${i.product.images}" alt="產品圖片" />
            <p>${i.product.title}</p>
          </div>
        </td>
        <td>NT$${(i.product.price).toLocaleString()}</td>
        <td>${i.quantity}</td>
        <td>NT$${(i.product.price * i.quantity).toLocaleString()}</td>
        <td class="discardBtn">
          <a href="###" class="material-icons" data-delete="${i.id}"> clear </a>
        </td>
      </tr>`;
        total += i.product.price * i.quantity;
    });

    let str = `<tr>
    <th width="40%">品項</th>
    <th width="15%">單價</th>
    <th width="15%">數量</th>
    <th width="15%">金額</th>
    <th width="15%"></th>
  </tr>
  ${productStr}
  <tr>
    <td>
      <a href="###" class="discardAllBtn">刪除所有品項</a>
    </td>
    <td></td>
    <td></td>
    <td>
      <p>總金額</p>
    </td>
    <td>NT$${total}</td>
  </tr>`
    shoppingCart.innerHTML = str;
};

// 加入購物車
productWrap.addEventListener('click', e => {
    let productId = e.target.getAttribute('data-id');

    let num = 1;
    cartData.forEach(i => {
        if (i.product.id === productId) {
            num = i.quantity += 1;
        }
    })

    let data = {
        "data": {}
    };


    if (e.target.getAttribute('class') === 'addCardBtn') {
        data.data.productId = productId;
        data.data.quantity = num

        axios.post(`${url}/${api_path}/carts`, data)
            .then(res => {
                cartData = res.data.carts;
                renderCart(cartData);
                swal('成功加入購物車！', '快去挑選更多品項吧 ⁽⁽٩(๑˃̶͈̀ ᗨ ˂̶͈́)۶⁾⁾', 'success');
            })
            .catch(err => console.log(err))
    };
});

// 刪除品項
shoppingCart.addEventListener('click', e => {
    e.preventDefault();

    let deleteId = '';
    // 刪除單個品項
    if (e.target.textContent === ' clear ') {
        deleteId = e.target.getAttribute('data-delete');

        axios.delete(`${url}/${api_path}/carts/${deleteId}`)
            .then(res => {
                cartData = res.data.carts;
                renderCart(cartData);
                swal('已刪除此筆品項！', '確定不買點東西嗎 இдஇ', 'success');
            })
            .catch(err => console.log(err));
    };

    // 刪除全部品項
    if (e.target.getAttribute('class') === 'discardAllBtn') {
        axios.delete(`${url}/${api_path}/carts`)
            .then(res => {
                cartData = res.data.carts;
                renderCart(cartData);
                swal('已清空您的購物車！', '確定不買點東西嗎 இдஇ', 'success');
            })
            .catch(err => console.log(err));
    };
});

// 送出表單
send.addEventListener('click', e => {
    e.preventDefault();

    let name = customerName.value;
    let tel = customerPhone.value;
    let email = customerEmail.value;
    let address = customerAddress.value;
    let payment = tradeWay.value;

    if (cartData.length === 0) {
        swal('目前購物車空空的', '要買東西才能送出資料呦 σ ﾟ∀ ﾟ) ﾟ∀ﾟ)σ', 'info');
        return;
    };

    orderInput();

    const errors = validate(form, constraints);
    renderErrors(errors);
    if (errors) {
        swal('表單資料錯誤！', '請填寫正確的資料喔', 'warning');
        return;
    }

    let customerData = {
        "data": {
            "user": {
                "name": name,
                "tel": tel,
                "email": email,
                "address": address,
                "payment": payment
            }
        }
    };

    axios.post(`${url}/${api_path}/orders`, customerData)
        .then(res => {
            swal('已收到您的訂單資料', '再去新增一筆訂單吧 ξ( ✿＞◡❛)', 'success');
        })
        .catch(err => {
            console.log(err);
        })
    form.reset();
})

// 初始化
function init() {
    getProductList();
    getCartList();
    orderInput();
};