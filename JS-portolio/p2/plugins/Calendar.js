//dayjs翻譯中文外掛
dayjs.locale('zh-tw');//指定語言
dayjs.extend(dayjs_plugin_localeData);//將外掛拓展給dayjs
dayjs.extend(dayjs_plugin_isSameOrBefore);
dayjs.extend(dayjs_plugin_isBetween);


//變數宣告
const
    fetchPath = "db.josn";
let
    nationalHoliday = [],
    pallet = {},
    booked = [],
    calendarCtrl = null,
    tableData = {
        totalPrice: 0,
        normalCount: 0,
        holidaycount: 0,
        pallet: {
            aArea: {
                title: '河畔 × A區', sellout: 0, sellInfo: '', sumPrice: 0, orderCount: 0
            },
            bArea: {
                title: '山間 × B區', sellout: 0, sellInfo: '', sumPrice: 0, orderCount: 0
            },
            cArea: {
                title: '平原 × C區', sellout: 0, sellInfo: '', sumPrice: 0, orderCount: 0
            },
            dArea: {
                title: '車屋 × D區', sellout: 0, sellInfo: '', sumPrice: 0, orderCount: 0
            }
        }
    };

//服務內容
const calendarService = () => {
    let
        theDay = dayjs(),
        objL = {
            title: '',
            lists: '',
            thisDate: theDay
        },
        objR = {
            title: '',
            lists: '',
            thisDate: theDay.add(1, 'month')
        }
    const
        today = dayjs(),
        tableDefault = (JSON.stringify(tableData)),
        //箭頭增減月份
        changeMonth = (count) => {
            // 翻新theDay並將objL、objR再次清空重印
            theDay = theDay.add(count, 'M');
            objL = {
                title: '',
                lists: '',
                thisDate: theDay
            },
                objR = {
                    title: '',
                    lists: '',
                    thisDate: theDay.add(1, 'month')
                }
        },
        /*
            [null,null]=>[1st,null]
            [1st,2nd]
            [2nd,1st]=>[1st,2nd]
            [3rd=>1st,2nd]
         */
        chooseDay = [null, null],
        chooseList = (item) => {
            if (item.classList.contains('selectHead')) return;
            //[null,null]
            if (!chooseDay[0] && !chooseDay[1]) {
                chooseDay[0] = item;
                item.classList.add('selectHead');
            }
            // [!null,null]
            else if (chooseDay[0] && !chooseDay[1]) {
                chooseDay[1] = item;
                const needswap = dayjs(item.dataset.date).isSameOrBefore(chooseDay[0].dataset.date);
                if (needswap) {
                    //repalce(不要的,要換的)
                    chooseDay[0].classList.replace('selectHead', 'selectFoot');
                    chooseDay[1].classList.add('selectHead');
                    [chooseDay[0], chooseDay[1]] = [chooseDay[1], chooseDay[0]];
                } else item.classList.add('selectFoot');
                //畫面有頭有尾了要加身體
                document.querySelectorAll('li.selectDay').forEach(item => {
                    if (item.dataset.date, dayjs(item.dataset.date).isBetween(chooseDay[0].dataset.date, chooseDay[1].dataset.date)) {
                        item.classList.add('selectConnect');
                    };
                });
                // 這時已完成頭尾身體的呈現，這裡要顯示表格
                tableMake();
            }
            // [!null,!null]=>[!null,null]
            else {
                document.querySelectorAll('li.selectConnect').forEach(item => {
                    item.classList.remove('selectConnect')
                });
                chooseDay[0].classList.remove('selectHead');
                chooseDay[1].classList.remove('selectFoot');
                chooseDay[0] = item;
                item.classList.add('selectHead');
                chooseDay[1] = null;
            }
        },
        //製造li
        listMaker = (obj) => {
            const
                firstDay = obj.thisDate.date(1).day(),
                totalDay = obj.thisDate.daysInMonth();
            //控制前面有多少空白
            for (let i = 1; i < (firstDay || 7); i++) {
                obj.lists += '<li class="JsCal"></li>';
            };
            //該月有多少天
            for (let i = 1; i <= totalDay; i++) {
                let classStr = 'JsCal';
                const dateStr = obj.thisDate.date(i).format('YYYY-MM-DD');
                //是否過期
                if (obj.thisDate.date(i).isSameOrBefore(today)) classStr += ' delDay';
                //判斷假日及國定假日
                else {
                    if (((i + firstDay) % 7 < 2) || nationalHoliday.includes(dateStr)) classStr += ' holiday';
                    //售完
                    const checkDay = booked.find(item => item.date == dateStr);
                    //判斷數量是否售完
                    if ((checkDay) && !(pallet.count - Object.values(checkDay.sellout).reduce((prev, item) => prev + item, 0))) classStr += ' fullDay';
                    classStr += ' selectDay';
                };
                obj.lists += `<li class="${classStr}" data-date="${dateStr}">${i}</li>`;
            };
            obj.title = `${dayjs.months()[obj.thisDate.month()]}  ${dayjs().year()}`;
            return obj;
        },
        //列印li
        listPrint = () => {
            //印出天
            document.querySelector('.leftDayList').innerHTML = listMaker(objL).lists;
            document.querySelector('.rightDayList').innerHTML = listMaker(objR).lists;
            //印出標題
            document.querySelector('.leftBar>h4').textContent = objL.title;
            document.querySelector('.rightBar>h4').textContent = objR.title;
            //增加hover行為
            document.querySelectorAll('.selectDay').forEach(item => {
                item.onclick = () => calendarCtrl.choose(item);
            })
        },
        //表格製造,規劃表個所需的操作,更新tableData的資料
        tableMake = () => {
            //先恢復資料讓tableData歸零,利用tableDefault複製過的string蓋過tableData將他洗乾淨
            tableData = JSON.parse(tableDefault);
            //key=aArea,bArea,cArea,dArea
            for (const key in tableData.pallet) {
                tableData.pallet[key].sellout = pallet[key].total;
            };
            //選擇天數=>知道選的日子可賣數量,透過(pallet的table跑批次)-(已賣出)=剩下可賣
            document.querySelectorAll('li.selectHead,li.selectConnect').forEach(node => {
                //確認選中的天數有沒有在訂單內
                const hasOrder = booked.find(item => {
                    return node.dataset.date === item.date
                })
                //將所選的日子與價錢顯示出來,並確定若有訂單的銷售數
                for (const key in tableData.pallet) {
                    //有訂單確認可銷售數
                    if (hasOrder) {
                        //目前的tableData.pallet[key].sellout與當下算的pallet[key].total - hasOrder.sellout[key]要取最小值
                        tableData.pallet[key].sellout = Math.min(tableData.pallet[key].sellout, pallet[key].total - hasOrder.sellout[key]);
                    }//沒訂單則沒人買則都可銷售
                    //顯示價錢,日子
                    const dayPrice = node.classList.contains('holiday') ? pallet[key].holidayPrice : pallet[key].normalPrice;
                    tableData.pallet[key].sumPrice += dayPrice;
                    tableData.pallet[key].sellInfo += `<div>${node.dataset.date} ${dayPrice}</div>`;
                };
                //判斷?晚平日?晚假日
                // node.classList.contains('holiday') ? tableData.holidaycount++ : tableData.normalCount++;
                tableData[node.classList.contains('holiday') ? 'holidaycount' : 'normalCount']++
            });
            tablePrint();
        },
        tablePrint = () => {
            document.querySelectorAll('form#selectPallet select').forEach(item => {
                const palletName = item.name;

                //更新下拉選單可賣的數量 select>option
                const count = tableData.pallet[palletName].sellout;
                let optionHtml = '';
                for (let i = 0; i <= count; i++) {
                    optionHtml += `<option value="${i}">${i}</option>`;
                    item.innerHTML = optionHtml;
                    // if (count === 0) item.disabled = true;
                    item.disabled = !count;
                };
                //更新日期以及價格select>parent>前面td兄弟
                item.parentElement.previousElementSibling.innerHTML = !count ? '' : tableData.pallet[palletName].sellInfo;

                //更新組數select>parent>parent>span
                item.parentElement.parentElement.querySelector('span').textContent = count;
            });

            //標題的寫入form#selectPallet>h3
            document.querySelector('form#selectPallet>h3').textContent = `$ ${tableData.totalPrice} / ${tableData.normalCount}晚平日，${tableData.holidaycount}晚假日`;
        }
    //閉包
    return {
        print: () => listPrint(),
        add: () => {
            changeMonth(1);
            listPrint();
        },
        sub: () => {
            changeMonth(-1);
            listPrint();
        },
        choose: item => {
            if (item.classList.contains('selectHead') && !chooseDay[1]) return;
            chooseList(item);
        },
        tableRefresh: () => {
            tablePrint();
        }
    }
};
//初始化作業 ES6 Fetch
const init = () => {
    calendarCtrl = calendarService();
    calendarCtrl.print();
    document.querySelector('form#selectPallet button').disabled = true;
    fetch('db.json').then(res => res.json()).then(json => {
        //解構賦值
        ({ nationalHoliday, pallet, booked } = json);

        //送出訂單的 offcanvas
        const offcanvas = new bootstrap.Offcanvas(document.querySelector('.offcanvas'));
        document.querySelector('form#selectPallet button').onclick = () => {
            let listStr = '';
            for (const key in tableData.pallet) {
                if (tableData.pallet[key].orderCount === 0) continue;
                listStr += `
                <li class="list-group-item d-flex justify-content-between align-items-start">
                    <div class="ms-2 me-auto">
                        <div class="fw-bold">${tableData.pallet[key].title}</div>
                            <div>
                                ${tableData.pallet[key].sellInfo}
                            </div>
                    </div>   
                        <span class="badge bg-warning rounded-pill">x <span class="fs-6">${tableData.pallet[key].orderCount}</span> 帳</span>
                </li>
                `
            };
            document.querySelector('.offcanvas ol').innerHTML = listStr;
            document.querySelector('.offcanvas h5.card-header').textContent = document.querySelector('form#selectPallet>h3').textContent;
            offcanvas.show();


            //另一種判斷orderCount都為時無法按下 {立即預約}
            // for (const key in tableData.pallet) {
            //     if (tableData.pallet[key].orderCount === 0)continue;
            //     offcanvas.show();
            // }

        };


        //addEventListener事件
        document.querySelector('a[href="#prevCtrl"]').addEventListener('click', (e) => {
            e.preventDefault();
            calendarCtrl.sub();
        })
        document.querySelector('a[href="#nextCtrl"]').addEventListener('click', (e) => {
            e.preventDefault();
            calendarCtrl.add();
        })
        const allSelect = document.querySelectorAll('form#selectPallet select');
        allSelect.forEach(selectNode => {
            //每次都要歸零

            selectNode.onchange = function () {
                tableData.totalPrice = 0;
                allSelect.forEach(item => {
                    tableData.totalPrice += item.value * tableData.pallet[item.name].sumPrice;
                });
                tableData.pallet[selectNode.name].orderCount = Number(selectNode.value);
                document.querySelector('form#selectPallet>h3').textContent = `$ ${tableData.totalPrice} / ${tableData.normalCount}晚平日，${tableData.holidaycount}晚假日`;
                document.querySelector('form#selectPallet button').disabled = !tableData.totalPrice;
            };
        });
        //更新表單
        calendarCtrl.tableRefresh();
    });
};

//執行初始化
init();



/*
閉包
解構賦值
淺拷貝
JSON.stringify
JSON.parse
fetch
preventDefault
contains
replace
includes
reduce
*/
