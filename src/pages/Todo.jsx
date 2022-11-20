import React from 'react'
import { db, storage } from '../firebase';
import { v4 as uuidv4 } from "uuid";
import { set, ref, onValue, remove, update } from 'firebase/database';
import { useState, useEffect } from 'react';
import * as dayjs from 'dayjs';
import { ref as refStorage, uploadBytes, getDownloadURL, } from 'firebase/storage'

const Todo = () => {
    const [todo, setTodo] = useState("")
    const [date, setDate] = useState("")
    const [desc, setDesc] = useState("")
    const [todos, setTodos] = useState([])
    const [isEdit, setIsEdit] = useState(false)
    const [tempUuid, setTempUuid] = useState("")
    const [image, setImage] = useState(null);

    useEffect(() => {
        onValue(ref(db), (snapshot) => {
            setTodos([]);
            const data = snapshot.val();
            if (data !== null) {
                Object.values(data).map((todo) => {
                    return setTodos((oldArray) => [...oldArray, todo])
                })
            }
        })
    }, [])

    /**
     * Очищает инпуты
     */
    const clearInputs = () => {
        setTodo("");
        setDate("");
        setDesc("");
    }

    /**
     * Создает задачу и заносит её в realtime database
     */
    const taskCreate = () => {
        const uuid = uuidv4();
        const status = 'В процессе';
        set(ref(db, `/${uuid}`), {
            todo,
            desc,
            date,
            status,
            uuid,
        })
        clearInputs()
    }

    /**
     * Включает режим редактирования задачи и меняет текст инпутов на текст параметров задачи
     * @param {object} task Данные определенной задачи
     */
    const taskUpdateInput = (task) => {
        setIsEdit(true);
        setTempUuid(task.uuid)
        setTodo(task.todo)
        setDate(task.date)
        setDesc(task.desc)
    }

    /**
     * Обновляет параметры задачи в realtime database
     */
    const taskUpdate = () => {
        update(ref(db, `/${tempUuid}`), {
            todo,
            desc,
            date,
            uuid: tempUuid,
        })
        clearInputs()
        setIsEdit(false);
    }

    /**
     * Обновляет статус задачи в realtime database
     * @param {object} task Данные определенной задачи
     */
    const statusUpdate = (task) => {
        let status = ''
        if (task.status === 'Готово') {
            status = 'В процессе'
            update(ref(db, `/${task.uuid}`), {
                status,
            })
        } if (task.status === 'В процессе') {
            status = 'Готово'
            update(ref(db, `/${task.uuid}`), {
                status,
            })
        }
    }

    /**
     * Удаляет задачу в realtime database
     * @param {object} task Данные определенной задачи
     */
    const taskDelete = (task) => {
        remove(ref(db, `/${task.uuid}`));
    }


    /**
     * Срабатывает, когда загружается файл и заносит его в стейт image 
     */
    const fileLoading = (e) => {
        if (e.target.files[0]) {
            setImage(e.target.files[0])
        }
    }

    /**
     * Загружает файл определенной задачи в storage и после этого обновляет массив файлов задачи в realtime database
     * @param {object} task Данные определенной задачи
     */
    const fileSubmit = (task) => {
        const uuid = uuidv4();
        const imageRef = refStorage(storage, uuid)
        uploadBytes(imageRef, image).then(() => {
            getDownloadURL(imageRef).then((url) => {
                let files = []
                if (task.files == null) {
                    files.push(url)
                    update(ref(db, `/${task.uuid}`), {
                        files,
                    })
                } else {
                    files = [...task.files]
                    files.push(url)
                    update(ref(db, `/${task.uuid}`), {
                        files: files,
                    })
                }
            }).catch((error) => {
                console.log(error.message)
            })
            setImage(null)
        })
            .catch((error) => {
                console.log(error.message)
            })
    }

    return (
        <div className='todo'>
            <input type="text" placeholder='Задача' value={todo} onChange={(e) => setTodo(e.target.value)} />
            <input type="text" placeholder='YYYY-MM-DD' value={date} onChange={(e) => setDate(e.target.value)} />
            <input type="text" placeholder='Описание' value={desc} onChange={(e) => setDesc(e.target.value)} />
            {isEdit ? (
                <>
                    <button onClick={taskUpdate}>Подтвердить изменение</button>
                    <button onClick={() => {
                        setIsEdit(false);
                        setTodo("");
                        setDate("");
                        setDesc("");
                    }}
                    >
                        X
                    </button>
                </>
            ) : (
                <button onClick={taskCreate}>Создать</button>
            )
            }

            <div className='tasks'>
                {todos.map((task, index) => {
                    return (
                        <div className='tasks__task' key={index}>
                            <div className='tasks__task-container'>
                                <div className='tasks__task-main'>
                                    <h2 className='tasks__task-title'>{task.todo}</h2>
                                    <p className='tasks__task-end-date'>{task.date}</p>
                                </div>
                                <div className='tasks__task-buttons'>
                                    {!dayjs().isAfter(dayjs(task.date)) ? <p className='tasks__task-status' onClick={() => statusUpdate(task)}>{task.status}</p>
                                        : <p className='tasks__task-status' onClick={() => statusUpdate(task)}>Время истекло</p>}
                                    <button onClick={() => taskUpdateInput(task)}>Редактировать</button>
                                    <button onClick={() => taskDelete(task)}>Удалить</button>
                                </div>
                            </div>
                            <p className='tasks__task-description'>{task.desc}</p>
                            <input type='file' onChange={fileLoading} />
                            <button onClick={() => fileSubmit(task)}>Прикрепить</button>
                            {task.files && task.files.map((file, index) => {
                                return (
                                    <a href={file} key={index}>
                                        <img className='tasks__task-file' src={file} alt='Файл'></img>
                                    </a>
                                )
                            })}
                        </div>
                    )
                })}
            </div>

        </div>
    )
}

export default Todo