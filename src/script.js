const linemodel = document.querySelector('li').cloneNode(true);
const list = document.querySelector('ul');
const button = document.querySelector('button');

document.querySelector('li').remove();

(async () => {

    const database = await fetch("https://to-do-backend-nfb8.onrender.com/tasks").then((res)=> {
        return res.json()
    }).then((data)=>{
        return data;
    });

    loadTasks(database);

    button.addEventListener('click',()=>{

        const newline = newTask('#','',0);

        newline.querySelector('.title').focus();

    })
    
})();

const newTask = (id,titulo,feito) => {

    const newline = linemodel.cloneNode(true);

    newline.querySelector('.title').value = titulo;
    newline.querySelector('.checkbox').checked = feito;
    
    newline.querySelector('.title').addEventListener('focusout', async ()=>{
        if(id === '#'){
            if(newline.querySelector('.title').value !== '') id = await postTask(newline.querySelector('.title').value,newline.querySelector('.checkbox').checked);
            else newline.remove();
        }
        else{
            if(newline.querySelector('.title').value === ''){
                newline.remove();
                await deleteTask(id);
            }
            else await patchTask(id,newline.querySelector('.title').value,newline.querySelector('.checkbox').checked)
        }
    });

    newline.querySelector('.checkbox').addEventListener('input', async ()=>{
        await patchTask(id,newline.querySelector('.title').value,newline.querySelector('.checkbox').checked)
    });
    
    newline.addEventListener('mouseover',(event)=>{
        newline.querySelector('i').style.display = 'block';
    });
    newline.addEventListener('mouseout',(event)=>{
        newline.querySelector('i').style.display = 'none';
    });
    newline.querySelector('i').addEventListener('click', async () => {
        newline.remove();
        await deleteTask(id);
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

    const response = await fetch("https://to-do-backend-nfb8.onrender.com/tasks",init).then((res)=> {
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

    const response = await fetch("https://to-do-backend-nfb8.onrender.com/tasks/"+id,init);
}

const deleteTask = async (id) => {

    const init = {
        method: 'DELETE'
    }

    const response = await fetch("https://to-do-backend-nfb8.onrender.com/tasks/"+id,init);
}