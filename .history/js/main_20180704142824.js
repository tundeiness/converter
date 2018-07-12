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
        .catch(err => console.log(JSON.stringify(err)));

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
            // saveRates(rates);
            const compact = Math.round(Object.values(rates) * 100) / 100;
            const con = Math.round((froGeld * compact) * 100) / 100;
            // const inverse = Math.round((toGeld / compact) * 100) / 100;

            toGeld.value = con;
            // froGeld.value = inverse;

        })
        .catch(err => console.log(JSON.stringify(err)));


}

/** 
 * Register service Worker without delaying Registration
 */

/* if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('./sw.js', { scope: '/' })
        .then(registration => {
            console.log("Service worker Registered");
        })
        .catch(err => {
            console.log("Service worker Failed to Register", err);
        });
} */


/** 
 * Register service Worker and delay Registration
 */

if ('serviceWorker' in navigator) {

    window.addEventListener('load', function() {
        navigator.serviceWorker
            .register('./sw.js', { scope: '/' })
            .then(registration => {
                console.log("Service worker Registered");
                console.log(registration.scope);
            })
            .catch(err => {
                console.log("Service worker Failed to Register", err);
            });
    })
}







//check for browser compatibility first

if (!window.idb) {
    console.log('browser is not supported');
    // return;
}


/* Open database for the country currency symbol*/



const apiURL = `https://free.currencyconverterapi.com/api/v5/countries`;

const name = 'countryRecords';

let dataBee = idb.open(name, 1, responseDB => {
    //consider a case where version may be old
    //before creating the objectStore
    switch (responseDB.oldVersion) {
        case 0:
        case 1:
            //create an objectStore
            responseDB.createObjectStore('countryRecords', { keyPath: 'countryId', autoIncrement: true });

    }

    // let txn = db.transaction('countryRecords', 'readwrite');
    // let countryStore = txn.objectStore('countryRecords');
})



//fetch the records

/* const getCountry = function(isCountry) {
    fetch(apiURL)
        .then(response => {
            return response.json();
        })
        .then(data => {
            dataBee.then(db => {
                    let txn = db.transaction('countryRecords', 'readwrite');
                    let countryStore = txn.objectStore('countryRecords');

                    for (let currency in data) {
                        for (let res in data[currency]) {
                            countryStore.put({
                                countryRecords: data[currency][res],
                                id: data[currency][res]["currencyId"]
                            });
                        }
                    }
                    return txn.complete;
                })
                .then(() => {
                    console.log("countries successfully added");
                })
        })
        .catch(() => {
            if (!isCountry)
                swal({
                    type: 'error',
                    title: 'Oops...',
                    text: 'I cannot find country'
                });
        })
} */



fetch(apiURL)
    .then(response => {
        return response.json();
    })
    .then(data => {
        dataBee.then(db => {
                if (!db) return;

                let txn = db.transaction('countryRecords', 'readwrite');
                let countryStore = txn.objectStore('countryRecords');

                console.log(data);
                for (let currency in data) {
                    for (let res in data[currency]) {
                        countryStore.put({
                            'countryRecords': `${data[currency][res]["currencyId"]}`
                        });
                    }
                }
                return txn.complete;
            })
            .then(() => {
                console.log("countries successfully added");
            })

    });


//open database for the rates

const ratesURL = `https://free.currencyconverterapi.com/api/v5/convert?q=${from}_${to}&compact=ultra`;

//let countriesRates = "";

let dbases = "bureauRates"

const ratePromise = idb.open(dbases, 1, upgradeDb => {
    //consider a case where version may be old
    //before creating the objectStore
    switch (upgradeDb.oldVersion) {
        case 0:
        case 1:
            //create an objectStore
            upgradeDb.createObjectStore('Rates', { keyPath: 'rateValue' });
    }
})


fetch(ratesURL)
    .then(response => {
        return response.json();
    })
    .then(rata => {
        ratePromise.then(db => {
                //  if (!db) return;
                let txnx = db.transaction('convRates', 'readwrite');
                let rateStore = txnx.objectStore('convRates');

                // for (let currency in data) {
                //     // console.log(currency);
                //     for (let res in data[currency]) {
                //         // console.log(res);
                rateStore.put(rata);
                //         // console.log(data[currency][res]["currencyId"]);
                //     }
                // }
                return txn.complete;
            })
            .then(() => {
                console.log("rates successfully added and stored");
            })

    })









/* const apiURL = `https://free.currencyconverterapi.com/api/v5/countries`;

let countriesCurrencies;

let dbbase = "bureauDC"

const dbPromise = idb.open('dbbase', 0, upgradeDB => {

    if (upgradeDB.oldVersion) {
        upgradeDB.createObjectStore('objectOne', { keyPath: 'id' });
    }
}); */


/* fetch(apiURL)
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
                   // store.put(currency.currencyId);
                    countryStore.put(currency.currencyId);
                }
            });
            return tx.complete;
        });
    }); */













//Store Rates

/* const ratesURL = `https://free.currencyconverterapi.com/api/v5/convert?q=${from}_${to}&compact=ultra`;

let countriesRates = "";

let dbases = "bureauRates"

const dbProm = idb.open('dbbases', 0, upgradeDB => {

    if (upgradeDB.oldVersion) {
        upgradeDB.createObjectStore('objectTwo', { keyPath: 'id' });
    }
});

 */

/* fetch(ratesURL)
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
    }); */



/* function openDbRates() {

    const dbName = 'Rates';
    const dbPromise = indexedDB.open(dbName, 1, upgradeDb => {

        if (upgradeDb.oldVersion) {
            console.log("now creating an object store for the currencies and the rates");
            let rateStore = upgradeDb.creatObjectStore('rates', { keyPath: 'query' });
        }

    });
    return dbPromise;
}
 */


/* function saveRates(data, query) {

    openDbRates()
        .then(event => {
            const store = event.transaction("rates", "readwrite").objectStore("rates");

            storage.put({ data: data, query: query });
        });

}
 */



/* save currencyID */

/* function saveCountries(chunk) {

    openDb()
        .then(event => {
            const storage = event.transaction("countries", "readwrite").objectStore("countries");
            Object.values(chunk).forEach(oneChunk => {
                storage.put(oneChunk);
            });
        });
}  */



/* dbPromise.then(db => {
    const ratesStore = db.transaction('rates').objectStore('rates');
    let storedRate;
    ratesStore
        .openCursor()
        .then(function cursorIterate(cursor) {
            if (!cursor) return;
            storedRate = cursor.value;
            // Once we find the wanted rate, the cursor stops iterating
            return (
                cursor.value.id === `${src_currency}_${dest_currency}` ||
                cursor.continue().then(cursorIterate)
            );
        })
        .then(isRateFound => {
            // returns undefined if not found, and returns the storedRate if found

            if (isRateFound && storedRate)
            // rate already stored
                resultingAmount.textContent = `${dest_currency} ${(
            storedRate.rate * inputAmount.value
          ).toFixed(2)}`;
            /*
            rate not found in IDB
            if the client is online the rate will be fetched and added to idb
            if offline the client will be shown an alert
            */
/* else
    return fetchRate(isRateFound).then(
        fetchedRate =>
        (resultingAmount.textContent = `${dest_currency} ${(
    fetchedRate * inputAmount.value
  ).toFixed(2)}`)
    ); */
//  });
//});

//inputAmount.focus(); */
//});