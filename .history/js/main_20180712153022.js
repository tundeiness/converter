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

    }

}