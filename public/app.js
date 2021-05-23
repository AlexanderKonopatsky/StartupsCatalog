const url = window.location.protocol + '//' + window.location.host

const socket = io(url);
let form = document.getElementsByClassName('like-course');


const toDate = date => {
    return new Intl.DateTimeFormat('en-EN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
    }).format(new Date(date))
}

let countListener = 0
function emitLike() {
    let counter = 0, count 
    form = document.getElementsByClassName('like-course');
    for (let i = countListener; i < form.length; i++) {
        form[i].addEventListener('click', e => {
            e.preventDefault();
            count = e.target.parentNode.childNodes[3]
            socket.emit('liked', { res: e.target.dataset.id});
            if (e.target.parentNode.childNodes[1].style.background == 'firebrick') {
                count.innerText = parseInt(count.innerText) - 1
            } else {
                count.innerText = parseInt(count.innerText) + 1
            }
        });
    } 
    countListener += form.length % 4 + 4
}


socket.on('like-course', (value) => {
    let likes = value.likeCount
    const form = document.getElementsByClassName('like-course');
    for (var i = 0; i < form.length; i++) {
        let elemId = form[i].childNodes[1].dataset.id
        if (elemId.toString() == value.id.toString()) {
            let countLike = form[i].childNodes[3]
            countLike.innerText = likes
            break
        } 
    }
})


let numberPageAdminNext = 0
function uploadCardsAdminNext() {
    let id, username, email, avatarUrl, title, desc, full_desc, resource_link, region, country, market, img, likeCount, status, htmlString = ''
    numberPageAdminNext++
    document.getElementById('numberPage').innerHTML = numberPageAdminNext + 1

    fetch(`/admin/page/${numberPageAdminNext}`, {
        method: 'GET'
    }).then(res => res.json()).then(s => {

        if (s.startups.length == 0) numberPageAdminNext--
        let index = numberPageAdminNext * 10 - 1

        s.startups.forEach(function (el) {
            index++
            id = el._id
            username = el.userId.name
            email = el.userId.email
            imgStartuprUrl = el.img
            title = el.title
            desc = el.desc
            full_desc = el.full_desc
            resource_link = el.resource_link
            region = el.region
            country = el.country
            market = el.market
            likeCount = el.likeCount
            userAvatarUrl = el.userId.avatarUrl
            img = el.img
            status = el.active
            
            htmlString += 
            `
                    <tbody> 
                        <tr>
                            <td >${index}</td>
                            <td style="display:none;">${id}</td>
                            <td>${username}</td>
                            <td>${email}</td>
                            <td ><img style="margin-top: 22px; margin-left: 15px" class="avatarUnderStartup" src="/${userAvatarUrl}" alt="avatar-${username}"></td>
                            <td>${title}</td>
                            <td>${desc}</td>
                            <td>${full_desc}</td>
                            <td>${resource_link}</td>
                            <td>${region}</td>
                            <td>${country}</td>
                            <td>${market}</td>
                            <td>${likeCount}</td>
                            <td><img width="100px" src="${imgStartuprUrl}"  alt="${title}"></td>
                            <td>${status}</td>
                            <td>
                                <button 
                                    style="width: 100px;"
                                    class="btn deleteStartup" 
                                    data-id=${id}
                                    >Delete
                                </button>
                                <button 
                                    style="width: 100px;"
                                    class="btn publishStartup" 
                                    data-id=${id}
                                    >Publish
                                </button>
                                <a style="color: white;" href="/startups/edit/${id}?allow=true"> <button style="width: 100px;"  class="btn ">Edit</button></a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            `
        })
        document.getElementById('tableStarup').innerHTML = htmlString
    })
}

let numberPageAdminPrevious = 0
function uploadCardsAdminPrevious() {
    numberPageAdminNext--
    numberPageAdminPrevious = numberPageAdminNext 

    let id, username, email, avatarUrl, title, desc, full_desc, resource_link, region, country, market, img, likeCount, status, htmlString = ''

    if (numberPageAdminPrevious !== -1) {
        document.getElementById('numberPage').innerHTML = numberPageAdminPrevious + 1

        fetch(`/admin/page/${numberPageAdminPrevious}`, {
            method: 'GET'
        }).then(res => res.json()).then(s => {

            let index = numberPageAdminPrevious * 10 + 9
            if (s.startups.length == 0 ) numberPageAdminPrevious++
           
            s.startups.forEach(function (el) {
                index++
                id = el._id
                username = el.userId.name
                email = el.userId.email
                imgStartuprUrl = el.img
                title = el.title
                desc = el.desc
                full_desc = el.full_desc
                resource_link = el.resource_link
                region = el.region
                country = el.country
                market = el.market
                likeCount = el.likeCount
                userAvatarUrl = el.userId.avatarUrl
                img = el.img
                status = el.active
                
                htmlString += 
                `
                        <tbody> 
                            <tr>
                                <td >${index}</td>
                                <td style="display:none;">${id}</td>
                                <td>${username}</td>
                                <td>${email}</td>
                                <td ><img style="margin-top: 22px; margin-left: 15px" class="avatarUnderStartup" src="/${userAvatarUrl}" alt="avatar-${username}"></td>
                                <td>${title}</td>
                                <td>${desc}</td>
                                <td>${full_desc}</td>
                                <td>${resource_link}</td>
                                <td>${region}</td>
                                <td>${country}</td>
                                <td>${market}</td>
                                <td>${likeCount}</td>
                                <td><img width="100px" src="${imgStartuprUrl}"  alt="${title}"></td>
                                <td>${status}</td>
                                <td>
                                    <button 
                                        style="width: 100px;"
                                        class="btn deleteStartup" 
                                        data-id=${id}
                                        >Delete
                                    </button>
                                    <button 
                                        style="width: 100px;"
                                        class="btn publishStartup" 
                                        data-id=${id}
                                        >Publish
                                    </button>
                                    <a style="color: white;" href="/startups/edit/${id}?allow=true"> <button style="width: 100px;"  class="btn ">Edit</button></a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                `
            })
            document.getElementById('tableStarup').innerHTML = htmlString
        })
        numberPageAdminPrevious--
    } else {
        numberPageAdminNext = 0
    }
}

const $card = document.querySelector('#card') 
let pageNumber = 1
let counterModalWindow = 3
function uploadCards() {
    let _id ,title, desc, full_desc, resource_link, img, likeCount, avatarUrl, name, userId, htmlString = ''
    let csrf = $('.js-remove').data('csrf');

    fetch(`/startups?page=${pageNumber}`, {
        method: 'GET',
    }).then(res => res.json()).then(s => {

        if (s.startups.length !== 0) pageNumber++

        s.startups.forEach(startup => {
             _id = startup._id
             title = startup.title
             desc = startup.desc
             full_desc = startup.full_desc
             resource_link = startup.resource_link
             img = startup.img
             likeCount = startup.likeCount
             avatarUrl = startup.userId.avatarUrl
             name = startup.userId.name
             email = startup.userId.email
             userId = startup.userId._id
             country = startup.counter
             market = startup.market_type
             createdDate = toDate(startup.createdDate)
             counterModalWindow++
             let checkLiked = false

             s.startupWithLikeArr.forEach(el => {
                 if (el.toString() == _id.toString()) {
                    checkLiked = true
                 }
             })

             if (checkLiked) {
                htmlString += `
                <div class="card">
                    <div class="card-image">
                        <div id="modal${counterModalWindow}" class="modal">
                        <div style="margin-bottom: 0px; padding-bottom: 0px" class="modal-content">
                            <h3 class="modalText">${title}</h3>
                            <h5 class="modalText" style="margin-bottom: 18px">${desc}</h5>
                            <img  src="${img}" alt="${title}">
                            <p class="modalText">${full_desc}</p>
                            <p class="modalTextCreater"> ${name}</p>
                            <p class="modalTextCreater">${email}</p>
                            <p class="modalTextCreater"> ${country} : ${market}</p>
                            <p class="modalTextCreater"> ${name} : ${email}</p>
                        </div>
                        <div style="padding-right: 30px; margin-bottom:10px" class="modal-footer">
                            <a href="#!" class="modal-close waves-effect waves-green btn-flat">Close</a>
                            <a href="${resource_link}" class="btn btnVisit" target="_blank"> Visit site</a>
                        </div>
                    </div>
                    <a class=" modal-trigger" href="#modal${counterModalWindow}"><img class="img_card" src="${img}"  alt="${title}"></a>
                </div>
                <div class="card-content">
                    <span class="card-title">${title}</span>
                    <p>${desc}</p>
                </div>
                <div class="card-action">
                    <div style="display: flex;">
                        <div class="like-course">
                            <button 
                                style="background:firebrick;"
                                type="submit" id="like"
                                class="btn btn-small js-remove material-icons" 
                                data-id="${_id}"
                                data-csrf=${csrf}
                            >thumb_up
                            </button> 
                            <i class="like-count">${likeCount}</i>
                        </div>
                        <a class="hrefImage" href="/profile/${userId}"><img class="avatarUnderStartup" src="/${avatarUrl}" alt="avatar-${name}"></a>
                    </div>
                    <p class="date">${createdDate}</p>
                </div>
            </div>
            `
             } else {

             htmlString += `
                <div class="card">
                    <div class="card-image">
                        <div id="modal${counterModalWindow}" class="modal" >
                        <div style="margin-bottom: 0px; padding-bottom: 0px" class="modal-content">
                            <h3 class="modalText">${title}</h3>
                            <h5 class="modalText" style="margin-bottom: 18px">${desc}</h5>
                            <img  src="${img}" alt="${title}">
                            <p class="modalText">${full_desc}</p>
                            <p class="modalTextCreater"> ${name}</p>
                            <p class="modalTextCreater">${email}</p>
                            <p class="modalTextCreater"> ${country} : ${market}</p>
                            <p class="modalTextCreater"> ${name} : ${email}</p>
                        </div>
                        <div style="padding-right: 30px; margin-bottom:10px" class="modal-footer">
                            <a href="#!" class="modal-close waves-effect waves-green btn-flat">Close</a>
                            <a href="${resource_link}" class="btn btnVisit" target="_blank"> Visit site</a>
                        </div>
                    </div>
                    <a class=" modal-trigger" href="#modal${counterModalWindow}"><img class="img_card" src="${img}"  alt="${title}"></a>
                </div>
                <div class="card-content">
                    <span class="card-title">${title}</span>
                    <p>${desc}</p>
                </div>
                <div class="card-action">
                    <div style="display: flex;">
                        <div class="like-course">
                            <button 
                                type="submit" id="like"
                                class="btn btn-small js-remove material-icons" 
                                data-id="${_id}"
                                data-csrf=${csrf}
                            >thumb_up
                            </button> 
                            <i class="like-count">${likeCount}</i>
                        </div>
                        <a class="hrefImage" href="/profile/${userId}"><img class="avatarUnderStartup" src="/${avatarUrl}" alt="avatar-${name}"></a>
                    </div>
                    <p class="date">${createdDate}</p>
                </div>
            </div>
            `
           }
        })

        $card.insertAdjacentHTML('beforeend', htmlString);
        
        emitLike()
       
        var elems = document.querySelectorAll('.modal');
        var instances = M.Modal.init(elems);
        instances.open();       
    })
};



$(document).ready(() => {
    $(document).on('click', '.upload_cards', uploadCards);
    $(document).on('click', '.uploadCardsAdminNext', uploadCardsAdminNext);
    $(document).on('click', '.uploadCardsAdminPrevious', uploadCardsAdminPrevious);
    emitLike();
    document.querySelectorAll('.date').forEach(node => { node.textContent = toDate(node.textContent)})
});


$(document).on('click', '.deleteStartup', function(e) {
    console.log('delete')
    const status = e.target.parentNode.parentNode.cells[14].innerText
    const id = e.target.dataset.id
    if (status == 'true') {
        fetch(`/admin/delete/${id}`, {
            method: 'GET'
        }).then(res => res.json()).then(r => {
            e.target.parentNode.parentNode.cells[14].innerText = r.status
        })
    }
});

$(document).on('click', '.publishStartup', function(e) {
    console.log('publish')
    const status = e.target.parentNode.parentNode.cells[14].innerText
    const id = e.target.dataset.id
    if (status == 'false') {
        fetch(`/admin/publish/${id}`, {
            method: 'GET'
        }).then(res => res.json()).then(r => {
            console.log(r)
            e.target.parentNode.parentNode.cells[14].innerText = r.status
        })
    } 
});

$(document).on('click', '.removeFromProfile', function(e) {
    let el = e.target
    el.parentNode.parentNode.parentNode.parentNode.classList.add('hide')
    let textCountSt  = document.getElementById('p_info')
    let numberSt = parseInt(textCountSt.textContent[0]) - 1
    console.log('numberSt: ', numberSt)
    textCountSt.innerText = numberSt + ' STARTUPS'
});


document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.modal');
    var instances = M.Modal.init(elems);
    instances.open();
});



if ($card) {
    $card.addEventListener('click', event => {
        if(event.target.classList.contains('js-remove')) {
            const id = event.target.dataset.id
            const csrf = event.target.dataset.csrf
            var checkboxes = document.querySelectorAll('.js-remove');
            let idx
            for (var i = 0, len = checkboxes.length; i < len; i++) {
                if (checkboxes[i].getAttribute('data-id').toString() == id) idx = i
            }

            if ($card.querySelectorAll('.js-remove')[idx].style.background == '') 
                 $card.querySelectorAll('.js-remove')[idx].style.background = 'firebrick';
            else  $card.querySelectorAll('.js-remove')[idx].style.background = ''
    
            fetch('/profile/' + id, {
                method: 'post',
                headers: {
                    'X-XSRF-TOKEN' : csrf
                }
            }).then(res => res.json()).then(startup => {
                console.log('background', $card.querySelectorAll('.js-remove')[idx].style.background)
            })
        }
    })
}


document.querySelector('#elastic').oninput = function() {
    let val = this.value.trim().toUpperCase()
    let elasticItems = document.querySelectorAll('.card-title')
    if (val != '') {
        elasticItems.forEach(function(elem) {
            if (elem.innerText.toUpperCase().search(val) == -1) {
                elem.parentNode.parentNode.classList.add('hide')
            } else {
                elem.parentNode.parentNode.classList.remove('hide')
            }
        })
    } else {
        elasticItems.forEach(function(elem) {
                elem.parentNode.parentNode.classList.remove('hide')
        })
    }
}


