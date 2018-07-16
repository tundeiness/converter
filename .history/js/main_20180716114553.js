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
        .catch(
            err => console.log(JSON.stringify(err))

        );
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

                    console.log("The task cannot be done offline");

                }
                return response.json();
            }).then(rates => {


                const compact = Math.round(Object.values(rates) * 100) / 100;
                const con = Math.round((froGeld * compact) * 100) / 100;

                toGeld.value = con;
            })
            .catch(
                // err => console.log(JSON.stringify(err))
                () => {
                    return offline();
                }
            );
    }

    conversion();




    // Store the values of the conversion rates
    // However let's open a database for storing rates first
    // received from the API

    function openDB() {

        let dbases = "bureauRates";
        return idb.open(dbases, 1, upgradeDb => {

            console.log(' Now creating a new object store');

            if (!upgradeDb.objectStoreNames.contains("bureauRates")) {
                upgradeDb.createObjectStore("bureauRates", { keyPath: "xid" })
                    .createIndex("refRateTxn", "xid", { unique: true });

            }

        });

    }





    function rateStorage() {

        return fetch(convUrl)
            .then(response => {
                return response.json();
            })
            .then(rata => {

                openDB().then(db => {
                        if (!db) return;
                        let txnx = db.transaction("bureauRates", 'readwrite');
                        let rateStore = txnx.objectStore("bureauRates");

                        rateStore.put({
                            'bureauRates': `${Object.values(rata)}`,
                            'xid': `${from}_${to}`
                        });
                        return txnx.complete;
                    })
                    .then(() => {
                        console.log("rates successfully added and stored");
                    })
                    .catch(err => console.log(JSON.stringify(err.status)));
            });

    }

    rateStorage();



    // setup a function to handle offline conversions. 

    function offline() {

        openDB().then(db => {

                //if (!db) return;
                let txn = db.transaction("bureauRates");
                let rateStore = txn.objectStore("bureauRates");
                let rateIndex = rateStore.index("refRateTxn");


                return rateIndex.openCursor();
            })
            .then(function rateIterate(cursor) {
                if (!cursor) return;
                let rateStur = cursor.value.xid;
                let bureau = cursor.value.bureauRates;

                //  console.log("cursor at: ", cursor.value.xid);
                // console.log("cursor at: ", cursor.value);
                // console.log("cursor at: ", bureau);


                let offGeld = document.getElementById("number1").value;
                let neuGeld = document.getElementById("text");
                const froTo = `${from}_${to}`;

                if (rateStur === froTo) {

                    let offOutput = Math.round((offGeld * bureau) * 100) / 100;
                    neuGeld.value = offOutput;

                }

                return cursor.continue()
                    .then(rateIterate);

            })
            .then(() => {

                //this sets up an async loop
                //indicating we  are at the end of the list. 
                //When we log Done cursoring
                // that means we have gone through the whole object store
                console.log("Done cursoring");

            });

    }

}


// Register service worker and delay registration

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
    });
}



// check for browser compatibility

if (!window.idb) {
    console.log('browser is not supported');
}



/* Open database for the country currency symbol*/


var name = 'currencyNam';

var dataBee = idb.open(name, 1, responseDB => {

    //consider a case where version may be old
    //before creating the objectStore

    switch (responseDB.oldVersion) {
        case 0:
        case 1:
            //create an objectStore
            responseDB.createObjectStore('currencyNam', { keyPath: 'currId' });

    }

});


//fetch the country records

function country() {
    return fetch(url)
        .then(response => {
            return response.json();
        })
        .then(data => {
            dataBee.then(db => {
                    if (!db) return;

                    let txn = db.transaction('currencyNam', 'readwrite');
                    let countryStore = txn.objectStore('currencyNam');

                    for (let currency in data) {
                        for (let res in data[currency]) {
                            countryStore.put({
                                'currencyNam': `${data[currency][res]["currencyName"]}`,
                                'currId': `${data[currency][res]["currencyId"]}`
                            });
                        }
                    }
                    return txn.complete;
                })
                .then(() => {
                    console.log("countries successfully added");
                })
                .catch(err => {
                    console.log("Error adding country data", err);
                })
        })
}

country();