const linemodel = document.querySelector('li').cloneNode(true);
const list = document.querySelector('ul');
const button = document.querySelector('button');
const url = "https://to-do-backend-nfb8.onrender.com";
const socket = io.connect(url);

socket.on('change-server', (change) => {
    
    document.querySelector(`.id${change.id}`).querySelector('.checkbox').checked = change.feito;
    document.querySelector(`.id${change.id}`).querySelector('.title').value = change.titulo;

});

socket.on('delete-server', (change) => {
    
    document.querySelector(`.id${change.id}`).remove();

});

socket.on('post-server', (change) => {
    
    newTask(change.id,change.titulo,change.feito);

});

document.querySelector('li').remove();

(async () => {

    const database = await fetch(url + "/tasks").then((res)=> {
        return res.json()
    }).then((data)=>{
        return data;
    });

    loadTasks(database);

    button.addEventListener('click',()=>{

        socket.emit('client-change', `${socket.id} clicou!`);

        const newline = newTask('#','',0);

        newline.querySelector('.title').focus();

    })
    
})();

const newTask = (id,titulo,feito) => {

    const newline = linemodel.cloneNode(true);
    newline.classList.add(`id${id}`);

    newline.querySelector('.title').value = titulo;
    newline.querySelector('.checkbox').checked = feito;
    
    //Mudou titulo
    newline.querySelector('.title').addEventListener('keyup', async ()=>{
        if(id === '#'){

        }
        else{

            await patchTask(id,newline.querySelector('.title').value,newline.querySelector('.checkbox').checked)
            socket.emit('change-client', {id: id, titulo: newline.querySelector('.title').value, feito: newline.querySelector('.checkbox').checked});

        }
    });

    newline.querySelector('.title').addEventListener('focusout', async ()=>{
        if(id === '#'){
            if(newline.querySelector('.title').value !== ''){
                id = await postTask(newline.querySelector('.title').value,newline.querySelector('.checkbox').checked);
                newline.classList.add(`id${id}`);
                socket.emit('post-client', {id: id, titulo: newline.querySelector('.title').value, feito: newline.querySelector('.checkbox').checked});
            }
            else newline.remove();
        }
        else{
            if(newline.querySelector('.title').value === ''){
                newline.remove();
                await deleteTask(id);
                socket.emit('delete-client', {id: id, titulo: newline.querySelector('.title').value, feito: newline.querySelector('.checkbox').checked});
            }
        }
    });

    //Mudou checkbox
    newline.querySelector('.checkbox').addEventListener('input', async ()=>{
        await patchTask(id,newline.querySelector('.title').value,newline.querySelector('.checkbox').checked)
        socket.emit('change-client', {id: id, titulo: newline.querySelector('.title').value, feito: newline.querySelector('.checkbox').checked});
    });
    
    newline.addEventListener('mouseover',(event)=>{
        newline.querySelector('i').style.display = 'block';
    });
    newline.addEventListener('mouseout',(event)=>{
        newline.querySelector('i').style.display = 'none';
    });

    //Clicou deletar
    newline.querySelector('i').addEventListener('click', async () => {
        newline.remove();
        await deleteTask(id);
        socket.emit('delete-client', {id: id, titulo: newline.querySelector('.title').value, feito: newline.querySelector('.checkbox').checked});
    })

    list.appendChild(newline);

    return newline;

}

const loadTasks = (database) => {

    database.forEach(element => {

        newTask(element.id,element.titulo,element.feito);

    });
}

const postTask = async (titulo,feito) => {

    const init = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            titulo: titulo,
            feito: feito
        }),
    }

    const response = await fetch(url + "/tasks",init).then((res)=> {
        return res.json()
    }).then((data)=>{
        return data;
    });

    return response.id;
}

const patchTask = async (id,titulo,feito) => {

    const init = {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            titulo: titulo,
            feito: feito
        }),
    }

    const response = await fetch(url + "/tasks/"+id,init);
}

const deleteTask = async (id) => {

    const init = {
        method: 'DELETE'
    }

    const response = await fetch(url + "/tasks/"+id,init);
}