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

                    optFrom.innerHTML += `<option value='${results[result][sm]["currencyId"]}'>${results[result][sm]["currencyName"]} ( ${results[result][sm]["currencySymbol"]} )</option>`;
                    optTo.innerHTML += `<option value='${results[result][sm]["currencyId"]}' >${results[result][sm]["currencyName"]} ( ${results[result][sm]["currencySymbol"]} )</option>`;
                    saveCountries(results[result][sm]);

                }
            }
        })
        .catch(err => console.log(JSON.stringify(err)));
});

//saveCountries(results[result][sm])
//results[result][sm]




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

            const compact = Math.round(Object.values(rates) * 100) / 100;
            const con = Math.round((froGeld * compact) * 100) / 100;
            // const inverse = Math.round((toGeld / compact) * 100) / 100;

            toGeld.value = con;
            // froGeld.value = inverse;
            saveRates(rates);

        })
        .catch(err => console.log(JSON.stringify(err)));


}

/** 
 * Register service Worker
 */

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
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
    //return;
}


/* Open database */


function openDb() {

    const dbName = 'BDC';
    const dbPromise = indexedDB.open(dbName, 1, upgradeDb => {

        if (upgradeDb.oldVersion) {
            console.log(`you are still using version ${upgradeDb.oldVersion}. An update is required`);
        } else {
            console.log("now creating an object store for the currencies and the rates");
            let countryStore = upgradeDb.creatObjectStore('countries', { keyPath: 'countryId' });

        }

    });
    return dbPromise;
}



function openDbRates() {

    const dbName = 'Rates';
    const dbPromise = indexedDB.open(dbName, 1, upgradeDb => {

        if (upgradeDb.oldVersion) {
            console.log(`you are still using version ${upgradeDb.oldVersion}. An update is required`);
        } else {
            console.log("now creating an object store for the currencies and the rates");
            let rateStore = upgradeDb.creatObjectStore('rates', { keyPath: 'query' });
        }

    });
    return dbPromise;
}



function saveRates(data, query) {

    openDbRates()
        .then(event => {
            const store = event.transaction("rates", "readwrite").objectStore("rates");
            storage.put({ data: data, query: query })
        });

}




/* save currencyID */

function saveCountries(chunk) {

    openDb()
        .then(event => {
            const storage = event.transaction("countries", "readwrite").objectStore("countries");
            Object.values(chunk).forEach(oneChunk => {
                storage.put(oneChunk);
            })
        });

}


/* save currencyID */


/* function saveCountries(chunk) {

    const oDb = openDb();

    oDb.onsuccess = event => {
        console.log('database opened');
        const search = event.target.result;

        const countryCurrency = search.transaction("countries").objectStore("countries").get(chunk[currencyId]);

        countryCurrency.onsuccess = event => {
            const baseData = event.target.result;
            const storage = search.transaction("countries", "readwrite").objectStore("countries");

            if (!baseData) storage.add(chunk, chunk[currencyId]);
            return;

            store.put(chunk, chunk[currencyId]);
        };
    }

} */