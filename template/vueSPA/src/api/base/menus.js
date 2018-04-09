import {createAPI} from '@/utils/request'

export const list = data => createAPI('/base/menus', 'get', data)
export const add = data => createAPI('/base/users', 'post', data)
export const update = data => createAPI('/base/users', 'put', data)
export const remove = data => createAPI('/base/users', 'delete', data)
export const detail = data => createAPI('/base/users/:id', 'get', data)
