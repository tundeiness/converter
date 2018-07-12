const url = 'https://free.currencyconverterapi.com/api/v5/countries';

$(document).ready(function() {

    let optFrom = document.getElementById('from');
    let optTo = document.getElementById('to');

    fetch(url, {
            method: 'GET',
            mode: 'cors',
            redirect: 'follow',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/plain'
            })
        }).then(response => {
            if (response.status !== 200) {

                console.log("There seems to be a problem");
                return;
            }

            return response.json();
        })
        .then(results => {

            for (const result in results) {
                for (const sm in results[result]) {

                    const currencyId = results[result][sm]["currencyId"];

                    const currencyName = results[result][sm]["currencyName"];

                    const currencySymbol = results[result][sm]["currencySymbol"];


                    optFrom.innerHTML += `<option id='${currencyId}'  value='${currencyId}'>${currencyName} ( ${currencySymbol} )</option>`;
                    optTo.innerHTML += `<option id='${currencyId}' value='${currencyId}'>${currencyName} ( ${currencySymbol} )</option>`;

                }
            }
        })
        .catch(() =>
            //err => console.log(JSON.stringify(err))
            {
                if (optFrom.options.namedItems(`${currencyId}`).text === " ") {
                    alert("please select a currency to make the conversion");
                }

                return;

            });
});


// Convert currency

function convertCurrency() {
    let from = document.getElementById("from").value;
    let to = document.getElementById("to").value;
    let froGeld = document.getElementById("number1").value;
    let toGeld = document.getElementById("text");


    const convUrl = `https://free.currencyconverterapi.com/api/v5/convert?q=${from}_${to}&compact=ultra`;
    //  const twoWay = `https://www.currencyconverterapi.com/api/v5/convert?q=${from}_${to},${to}_${from}&compact=ultra`;

    function conversion() {

        fetch(convUrl).then(response => {
                if (response.status !== 200) {
                    console.log("There seems to be a problem");
                    return;
                }
                return response.json();
            }).then(rates => {
                // console.log(rates);
                const compact = Math.round(Object.values(rates) * 100) / 100;
                const con = Math.round((froGeld * compact) * 100) / 100;

                toGeld.value = con;
            })
            .catch(
                err => console.log(JSON.stringify(err))
                //  () => {
                // catch an error if inputs field for conversion is empty 
                // or if entries are not numbers. 

                //   if (froGeld === '' && isNaN(froGeld)) {
                // show an alert message if amount field is empty
                //      alert("input amount cannot be empty and cannot be alphabets");
                // froGeld.setAttribute('placeholder', 'amount not given');
                //      froGeld.style.backgroundColor = 'red';
                // return;
                // }
                // return;
                //  }
            );



        //conversion();


        // store the values of the conversion rates


        function createDB() {
            let dbases = "bureauRates";
            return idb.open(dbases, 1, upgradeDb => {

                console.log(' Now creating a new object store');

                if (!upgradeDb.objectStoreNames.contains("bureauRates")) {
                    upgradeDb.createObjectStore("bureauRates", { autoIncrement: true })
                        .createIndex("refRateTxn", "xRate", { unique: true });

                }

            });
        }


        function rateStorage() {

            return fetch(convUrl)
                .then(response => {
                    return response.json();
                })
                .then(rata => {

                    // console.log(`${Object.entries(rata)}`);

                    createDB().then(db => {
                            // if (!db) return;
                            let txnx = db.transaction("bureauRates", 'readwrite');
                            let rateStore = txnx.objectStore("bureauRates");

                            //console.log(`${rata}`);

                            //   `${from}_${to}`

                            rateStore.put({
                                'bureauRates': `${Object.entries(rata)}`
                            });
                            return txnx.complete;
                        })
                        .then(() => {
                            console.log("rates successfully added and stored");
                        })
                        .catch(err => console.log(JSON.stringify(err)));

                });


        }

        return rateStorage();

    }