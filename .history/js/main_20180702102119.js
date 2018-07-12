$(document).ready(function() {

            let optFrom = document.getElementById('from');
            let optTo = document.getElementById('to');

            const url = 'https://free.currencyconverterapi.com/api/v5/countries';




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


                            optFrom.innerHTML += `<option value='${currencyId}'>${currencyName} ( ${currencySymbol} )</option>`;
                            optTo.innerHTML += `<option value='${currencyId}'>${currencyName} ( ${currencySymbol} )</option>`;



                            // optFrom.innerHTML += `<option value='${results[result][sm]["currencyId"]}'>${results[result][sm]["currencyName"]} ( ${results[result][sm]["currencySymbol"]} )</option>`;
                            // optTo.innerHTML += `<option value='${results[result][sm]["currencyId"]}' >${results[result][sm]["currencyName"]} ( ${results[result][sm]["currencySymbol"]} )</option>`;

                            //saveCountries(results[result][sm]);

                        }
                    }
                })
                .catch(err => console.log(JSON.stringify(err));

                });




        /**
         * Convert currency function
         */

        function convertCurrency() {
            let from = document.getElementById("from").value;
            let to = document.getElementById("to").value;
            let froGeld = document.getElementById("number1").value;
            let toGeld = document.getElementById("text");

            const convUrl = `https://free.currencyconverterapi.com/api/v5/convert?q=${from}_${to}&compact=ultra`;
            //  const twoWay = `https://www.currencyconverterapi.com/api/v5/convert?q=${from}_${to},${to}_${from}&compact=ultra`;

            fetch(convUrl).then(response => {
                    if (response.status !== 200) {
                        console.log("There seems to be a problem");
                        return;
                    }


                    return response.json();
                }).then(rates => {
                    //saveRates(rates);
                    const compact = Math.round(Object.values(rates) * 100) / 100;
                    const con = Math.round((froGeld * compact) * 100) / 100;
                    // const inverse = Math.round((toGeld / compact) * 100) / 100;

                    toGeld.value = con;
                    // froGeld.value = inverse;


                })
                .catch(err => console.log(JSON.stringify(err)));


        }

        /** 
         * Register service Worker
         */

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('./sw.js', { scope: '/' })
                .then(registration => {
                    console.log("Service worker Registered");
                })
                .catch(err => {
                    console.log("Service worker Failed to Register", err);
                });
        }






        //check for browser compatibility first

        if (!('indexedDB' in window)) {
            console.log('browser is not supported');
        }


        /* Open database */


        /* function openDb() {

            const dbName = 'BDC';
            const dbPromise = indexedDB.open(dbName, 1, upgradeDb => {

                if (upgradeDb.oldVersion) {
                    let countryStore = upgradeDb.creatObjectStore('countries', { keyPath: 'countryId' });
                }

            });
            return dbPromise;
        } */

        const apiURL = `https://free.currencyconverterapi.com/api/v5/countries`;

        let countriesCurrencies;

        let dbbase = "bureauDC"

        const dbPromise = idb.open('dbbase', 0, upgradeDB => {

            if (upgradeDB.oldVersion) {
                upgradeDB.createObjectStore('objectOne', { keyPath: 'id' });
            }
        });


        fetch(apiURL)
        .then(response => {
            return response.json();
        })
        .then(data => {

            dbPromise.then(db => {
                if (!db) return;

                countriesCurrencies = [data.results];

                const tx = db.transaction('objectOne', 'readwrite');

                const store = tx.objectStore('objectOne');

                countriesCurrencies.forEach(currency => {
                    for (let value in currency) {
                        store.put(currency.currencyId);
                    }
                });
                return tx.complete;
            });
        });



        //Store Rates

        const ratesURL = `https://free.currencyconverterapi.com/api/v5/convert?q=${from}_${to}&compact=ultra`;

        let countriesRates = "";

        let dbases = "bureauRates"

        const dbProm = idb.open('dbbases', 0, upgradeDB => {

            if (upgradeDB.oldVersion) {
                upgradeDB.createObjectStore('objectTwo', { keyPath: 'id' });
            }
        });



        fetch(ratesURL)
        .then(response => {
            return response.json();
        })
        .then(rateData => {

            dbProm.then(db => {
                if (!db) return;



                const txn = db.transaction('objectTwo', 'readwrite');

                const stores = txn.objectStore('objectTwo');
                stores.put(rateData);

            });
            return tx.complete;
        });



        /* function openDbRates() {

            const dbName = 'Rates';
            const dbPromise = indexedDB.open(dbName, 1, upgradeDb => {

                if (upgradeDb.oldVersion) {
                    console.log("now creating an object store for the currencies and the rates");
                    let rateStore = upgradeDb.creatObjectStore('rates', { keyPath: 'query' });
                }

            });
            return dbPromise;
        } */



        /* function saveRates(data, query) {

            openDbRates()
                .then(event => {
                    const store = event.transaction("rates", "readwrite").objectStore("rates");

                    storage.put({ data: data, query: query })
                });

        }
         */



        /* save currencyID */

        /*  function saveCountries(chunk) {

            openDb()
                .then(event => {
                    const storage = event.transaction("countries", "readwrite").objectStore("countries");
                    Object.values(chunk).forEach(oneChunk => {
                        storage.put(oneChunk);
                    });
                });
 */