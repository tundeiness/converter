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
            /* {
                if (optFrom.options.namedItems(`${currencyId}`).text === " ") {
                    alert("please select a currency to make the conversion");
                }

                return;

            } */
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
                    //run offline function here
                    return offline();
                    // console.log("The task cannot be done offline");
                    // return;
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
                /* () => {
                    // catch an error if inputs field for conversion is empty 
                    // or if entries are not numbers. 

                    if (froGeld === '' && isNaN(froGeld)) {
                        // show an alert message if amount field is empty
                        alert("input amount cannot be empty and cannot be alphabets");
                        // froGeld.setAttribute('placeholder', 'amount not given');
                        froGeld.style.backgroundColor = 'red';
                        // return;
                    }
                    return;
                } */
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


    //  function createAndStore() {

    /* function createDB() {
        let dbases = "bureauRates";
        return idb.open(dbases, 1, upgradeDb => {

            console.log(' Now creating a new object store');

            if (!upgradeDb.objectStoreNames.contains("bureauRates")) {
                upgradeDb.createObjectStore("bureauRates", { keyPath: "xid" })
                    .createIndex("refRateTxn", "xid", { unique: true });

            }

        });
    } */



    function rateStorage() {

        return fetch(convUrl)
            .then(response => {
                return response.json();
            })
            .then(rata => {

                // console.log(`${Object.entries(rata)}`);

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

    // }



    // setup a function to handle offline conversions. 



    function offline() {

        //const compact = Math.round(Object.values(rates) * 100) / 100;
        // const con = Math.round((froGeld * compact) * 100) / 100;

        // toGeld.value = con;

        openDB().then(db => {

                // if (!db) return;
                let txn = db.transaction("bureauRates");
                let rateStore = txn.objectStore("bureauRates").index("refRateTxn");

                //let rateIndex = rateStore.index("refRateTxn");

                // return rateStore.get(`${from}_${to}`);

                //if (rateStore) {}

                // return rateStore.getAll(`${from}_${to}`);
                return rateStore.openCursor();
            })
            .then(function rateIterate(cursor) {
                if (!cursor) return;
                let rateStur = cursor.value;

                console.log("cursor at: ", cursor.value);

                let offGeld = document.getElementById("number1").value;
                let neuGeld = document.getElementById("text");


                return cursor.value.xid === `${from}_${to}` ||
                    cursor.continue()
                    .then(rateIterate);

            })
            .then(() => {
                console.log("Done cursoring");

                let offOutput = offGeld * rateStur;
                neuGeld.value(offOutput);

                /*  if (!createAndStore) {
                     toGeld.value(`${rateStur}`);
                 } */

            });

    }



    /* function createDB() {
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

                // console.log(`${Object.entries(rata)}`);

                createDB().then(db => {
                        // if (!db) return;
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
                    .catch(err => console.log(JSON.stringify(err)));

            });


    }
 */
    //   window.addEventListener('online', createAndStore());

    //  window.addEventListener('offline', offlineFetch());

    // check for rate in indexedDB
    //TODO HERE TODAY

    //   function offlineFetch() {



    //   return;

    //  }

    /* createDB().then(db => {
            let txn = db.transaction("bureauRates");
            let rateStore = txn.objectStore("bureauRates");


            let rateIndex = rateStore.index("refRateTxn");

            //return rateIndex.getAll("AFN_XCD");
            if (response.status !== 200) {
                //return rateIndex.getAll(`${from}_${to}`);
                return rateIndex.get(`${from}_${to}`);

            }
            // return rateIndex.getAll("AFN_XCD");

        })
        .then(rTxn => {
            console.log("bureauRates: ", rTxn);
        });
 */
    //  return rateStorage();


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
           //upgradeDB.createObjectStore('rates', { keyPath: 'id' });


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

   // let inputAmount = document.getElementById('js_inputAmount');
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