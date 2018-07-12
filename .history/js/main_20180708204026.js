const url = 'https://free.currencyconverterapi.com/api/v5/countries';


$(document).ready(function() {

    let optFrom = document.getElementById('from');
    let optTo = document.getElementById('to');

    //  const url = 'https://free.currencyconverterapi.com/api/v5/countries';


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
                //function to fetch from indexeddb here
                console.log("There seems to be a problem");
                return;
            }

            return response.json();
        })
        .then(results => {

            //let sorted = results.sort();

            // const sorted = [...results].sort((a, b) => { return (a.currencyId > b.currencyId) ? 1 : ((b.currencyId > a.currencyId) ? -1 : 0) });

            // console.log(sorted);

            let sorting = [];
            for (const result in results) {
                for (const sm in results[result]) {

                    sorting.push(results[result][sm]["currencyName"]);
                    console.log(sorting);

                    // const newer = sorting.sort("currencyName")

                    const currencyId = results[result][sm]["currencyId"];

                    const currencyName = results[result][sm]["currencyName"];

                    const currencySymbol = results[result][sm]["currencySymbol"];


                    optFrom.innerHTML += `<option value='${currencyId}'>${currencyName} ( ${currencySymbol} )</option>`;
                    optTo.innerHTML += `<option value='${currencyId}'>${currencyName} ( ${currencySymbol} )</option>`;

                    // optFrom.innerHTML += `<option value='${results[result][sm]["currencyId"]}'>${results[result][sm]["currencyName"]} ( ${results[result][sm]["currencySymbol"]} )</option>`;
                    // optTo.innerHTML += `<option value='${results[result][sm]["currencyId"]}' >${results[result][sm]["currencyName"]} ( ${results[result][sm]["currencySymbol"]} )</option>`;

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
            console.log(rates);
            const compact = Math.round(Object.values(rates) * 100) / 100;
            const con = Math.round((froGeld * compact) * 100) / 100;

            toGeld.value = con;
        })
        .catch(err => console.log(JSON.stringify(err)));



    // store the values of the conversion rates

    function createDB() {
        return idb.open(dbases, 1, upgradeDb => {
            //consider a case where version may be old
            //before creating the objectStore
            switch (upgradeDb.oldVersion) {
                case 0:
                case 1:
                    //create an objectStore
                    upgradeDb.createObjectStore('Rates', { keyPath: 'xId' });
                    //  upgradeDb.transaction('Rates').createIndex('xchange', 'values');
                    //case 2:
                    // create index for ease of retrival and comparison when the version changes. 
                    //    upgradeDb.transaction('Rates').createIndex('xchange', 'values');

            }
        });
    }

    let dbases = "bureauRates";

    const ratePromise = idb.open(dbases, 1, upgradeDb => {
        //consider a case where version may be old
        //before creating the objectStore
        switch (upgradeDb.oldVersion) {
            case 0:
            case 1:
                //create an objectStore
                upgradeDb.createObjectStore('Rates', { keyPath: 'xId' });
                //  upgradeDb.transaction('Rates').createIndex('xchange', 'values');
                //case 2:
                // create index for ease of retrival and comparison when the version changes. 
                //    upgradeDb.transaction('Rates').createIndex('xchange', 'values');

        }
    });



    fetch(convUrl)
        .then(response => {
            return response.json();
        })
        .then(rata => {
            createDB().then(db => {
                    if (!db) return;
                    let txnx = db.transaction('Rates', 'readwrite');
                    let rateStore = txnx.objectStore('Rates');

                    // console.log(JSON.stringify(rata));

                    rateStore.put({
                        'xId': `${Object.keys(rata)}`,
                        'Rates': `${Object.values(rata)}`

                    });
                    return txnx.complete;
                })
                .then(() => {
                    console.log("rates successfully added and stored");
                })
                .catch(err => console.log(JSON.stringify(err)));

        });


    /*   ratePromise.then(db =>{

        })
 */


}


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
    });
}







//check for browser compatibility first

if (!window.idb) {
    console.log('browser is not supported');
    // return;
}


/* Open database for the country currency symbol*/



//const apiURL = `https://free.currencyconverterapi.com/api/v5/countries`;

const name = 'countryRecords';

let dataBee = idb.open(name, 1, responseDB => {
    //consider a case where version may be old
    //before creating the objectStore
    switch (responseDB.oldVersion) {
        case 0:
        case 1:
            //create an objectStore
            responseDB.createObjectStore('countryRecords', { keyPath: 'countryId' });

    }

})



//fetch the records

fetch(url)
    .then(response => {
        return response.json();
    })
    .then(data => {
        dataBee.then(db => {
                if (!db) return;

                let txn = db.transaction('countryRecords', 'readwrite');
                let countryStore = txn.objectStore('countryRecords');

                // console.log(data);
                for (let currency in data) {
                    for (let res in data[currency]) {
                        countryStore.put({
                            'countryRecords': `${data[currency]}`,
                            'countryId': `${data[currency][res]["currencyId"]}`
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
            });

    });


//open database for the rates
//and fetch rates converted on click of a button
//also save this rates in indexedDB

//const toggler = document.getElementById('rfetch');
//const inputAmount = document.getElementById('number1');

/* toggler.addEventListener('click', () => {

    //let froGeld = document.getElementById("number1").value;
    //let toGeld = document.getElementById("text");

   // const ratesURL = `https://free.currencyconverterapi.com/api/v5/convert?q=${from}_${to}&compact=ultra`;

    //let dbases = "bureauRates";

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
                    if (!db) return;
                    let txnx = db.transaction('Rates', 'readwrite');
                    let rateStore = txnx.objectStore('Rates');

                    // console.log(JSON.stringify(rata));

                    rateStore.put({
                        'Rates': `${Object.values(rata)}`,
                        'rateValue': `${Object.keys(rata)}`
                    });
                    return txnx.complete;
                })
                .then(() => {
                    console.log("rates successfully added and stored");
                })

        })

}); */






























/// CODES TO WORK ON

/*    let dbPromise;

   window.addEventListener('load', () => {

     // populate the `select` elements
     const selectElements = document.getElementsByTagName('select');

     // Fetch all the currencies from currencyconverterapi
     fetch('https://free.currencyconverterapi.com/api/v5/currencies')
       .then(currennciesResp => currennciesResp.json())
       .then(currencies => {

         // a helper function to compare currencies' Id, for the purpose of sorting
         function compareCurrencyId(a, b) {
           return a.id < b.id ? -1 : 1;
         }

         let currencyName;

         let currencyCode;

         let option; // `option` node to hold new currencies' options being added
   
         // I put all the objects representing each currency in an array
         // in order to apply .sort() to it
         for (const currency of Object.values(currencies.results).sort(
           compareCurrencyId
         )) {
           // currencies are sorted alphabetically by their id's

           currencyName = currency.currencyName;
           currencyCode = currency.id;
           option = document.createElement('option');
           option.innerText = `${currencyCode} | ${currencyName}`;
           option.id = currencyCode;
           // You can't append a node in two points of the document
           // .cloneNode() makes a copy of the node
           // with an option of `true` to clone the node's content as well

           selectElements[0].appendChild(option.cloneNode(true));
           selectElements[1].appendChild(option);
         }
       });

     // Register Service Worker
     if ('serviceWorker' in navigator) {
       navigator.serviceWorker
         .register('./sw.js')
         .then(reg => console.log('Registration successful'))
         .catch(() => console.log('Registration failed'));
     }

     // open an idb
     dbPromise = idb.open('currenciesDB', 1, upgradeDB => {
       upgradeDB.createObjectStore('rates', { keyPath: 'id' });
     });
   });
   
   const convertBtn = document.getElementById('js_convertBtn');
   let inputAmount = document.getElementById('js_inputAmount');
   let resultingAmount = document.getElementById('js_resultingAmount');
   const srcSelect = document.getElementsByTagName('select')[0];
   const destSelect = document.getElementsByTagName('select')[1];
   
   convertBtn.addEventListener('click', () => {
     const src_selected_opt = srcSelect.options[srcSelect.selectedIndex];
     const dest_selected_opt = destSelect.options[destSelect.selectedIndex];
     const src_currency = src_selected_opt.id;
     const dest_currency = dest_selected_opt.id;
   
     const fetchRate = function(isRateFound) {

       return fetch(
         `https://free.currencyconverterapi.com/api/v5/convert?q=${src_currency}_${dest_currency}&compact=ultra`
       )
         .then(rateResp => {
           return rateResp.json();
         })
         .then(rate => {
           const rate_value = rate[`${src_currency}_${dest_currency}`];

           // convert using the fetched rate
           //resultingAmount.textContent = `${dest_currency} ${(rate_value * inputAmount.value).toFixed(2)}`;
           // Add the fetched rate to IndexedDB

           dbPromise.then(db => {
             const tx = db.transaction('rates', 'readwrite');
             const ratesStore = tx.objectStore('rates');
   
             // add it if it doesn't exist, or update it if it already exists
             ratesStore.put({
               rate: rate_value,
               id: `${src_currency}_${dest_currency}`
             });
             return tx.complete;
           });
           return rate_value;
         })
         .catch(() => {
           if (!isRateFound)
             // if rateStored is true do nothing
             // (because the resulting amount was already shown to the user)
             // otherwise show alert (that says, you're offline, and that rate isn't stored)
             swal({
               type: 'error',
               title: 'Oops...',
               text: 'I cannot convert this while offline'
             });
         });
     };
   
     if (inputAmount.value === '') {
       // show an alert message if amount field is empty
       swal({
         type: 'error',
         title: 'Oops...',
         text: 'This field cannot be empty'
       });
       return;
     }


     // look for the rate in IDB, if it's not there, fetch it and add it to IDB
     // ALSO update the rates if they've changed

     dbPromise.then(db => {
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
//    });
//  });

//   inputAmount.focus();
//  });