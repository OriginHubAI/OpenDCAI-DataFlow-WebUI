/* eslint-disable */
// More information: https://github.com/minskiter/openapijs
import axios, { dfApiPrefix } from './config.js'
import * as Axios from 'axios'
import * as UserModel from './model.js'

// fix vite error.
const CancelTokenSource = Axios.CancelTokenSource

export class datasets {
    /**
     * @summary 返回目前所有注册的数据集列表，包含每个数据集的条目数和文件大小
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可 以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async list_datasets(cancelSource, uploadProgress, downloadProgress) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'get',
                url: import.meta.env.VITE_USE_HF_ENDPOINT === 'true' ? '/api/hf/api/datasets' : dfApiPrefix + '/datasets/',
                data: {},
                params: {},
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        // Compatibility layer: HF endpoint returns direct array, v1 returns { success, data: [] } wrapper
                        if (import.meta.env.VITE_USE_HF_ENDPOINT === 'true') {
                            resolve({ success: true, code: 200, data: res.data })
                            return { success: true, code: 200, data: res.data }
                        } else {
                            resolve(res.data)
                            return res.data
                        }
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 注册一个新的数据集或更新已有数据集的信息，根据路径作为唯一主键
     * @param {UserModel.DatasetIn} [datasetin]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async register_dataset(datasetin, cancelSource, uploadProgress, downloadProgress) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'post',
                url: import.meta.env.VITE_USE_HF_ENDPOINT === 'true' ? '/api/hf/api/repos/create' : dfApiPrefix + '/datasets/',
                data: import.meta.env.VITE_USE_HF_ENDPOINT === 'true' ? { name: datasetin.name, type: 'dataset' } : datasetin,
                params: {},
                headers: {
                    'Content-Type': 'application/json'
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        if (import.meta.env.VITE_USE_HF_ENDPOINT === 'true') {
                            resolve({ success: true, code: 200, data: res.data })
                            return { success: true, code: 200, data: res.data }
                        } else {
                            resolve(res.data)
                            return res.data
                        }
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary List files in directory
     * @param {String} [path]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async listDir(path, cancelSource, uploadProgress, downloadProgress) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'get',
                url: dfApiPrefix + '/datasets/list_dir',
                data: {},
                params: { path },
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 根据数据集 ID 获取数据集信息
     * @param {String} [pathds_id]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async get_dataset(pathds_id, cancelSource, uploadProgress, downloadProgress) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let isHF = import.meta.env.VITE_USE_HF_ENDPOINT === 'true'
            // For HF, dataset ID is the repo_id e.g. "local/my-dataset"
            let options = {
                method: 'get',
                url: dfApiPrefix + '/datasets/' + pathds_id + '',
                data: {},
                params: {},
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        if (isHF) {
                            resolve({ success: true, code: 200, data: res.data })
                            return { success: true, code: 200, data: res.data }
                        } else {
                            resolve(res.data)
                            return res.data
                        }
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 根据数据集 ID 删除数据集
     * @param {String} [pathds_id]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async delete_dataset(pathds_id, cancelSource, uploadProgress, downloadProgress) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let isHF = import.meta.env.VITE_USE_HF_ENDPOINT === 'true'
            let options = {
                method: 'delete',
                url: isHF ? '/api/hf/api/repos/delete' : dfApiPrefix + '/datasets/' + pathds_id + '',
                data: isHF ? { name: pathds_id.split('/').pop() || pathds_id, type: 'dataset' } : {},
                params: {},
                headers: {
                    'Content-Type': isHF ? 'application/json' : ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        if (isHF) {
                            resolve({ success: true, code: 200, data: res.data })
                            return { success: true, code: 200, data: res.data }
                        } else {
                            resolve(res.data)
                            return res.data
                        }
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 获取指定数据集的 Pandas 类型样本数据,用于前端展示预览，可以通过start和end参数控制获取多少数据
     * @param {String} [pathds_id]
     * @param {Number} [start]
     * @param {Number} [end]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async get_pandas_data(
        pathds_id,
        start,
        end,
        cancelSource,
        uploadProgress,
        downloadProgress
    ) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let isHF = import.meta.env.VITE_USE_HF_ENDPOINT === 'true'
            let options = {
                method: 'get',
                url: isHF ? '/api/hf/viewer/rows' : dfApiPrefix + '/datasets/file_type_sample/' + pathds_id + '',
                data: {},
                params: isHF ? { dataset: pathds_id, config: "default", split: "default", offset: start || 0, length: end ? end - (start || 0) : 5 } : { start, end },
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        if (isHF) {
                            let mapped_data = res.data.rows.map(r => r.row)
                            // return as JSON string to match backend format of v1 pandas_type_sample
                            let data_str = JSON.stringify(mapped_data)
                            resolve({ success: true, code: 200, data: data_str })
                            return { success: true, code: 200, data: data_str }
                        } else {
                            resolve(res.data)
                            return res.data
                        }
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 获取指定数据集的文件类型样本数据，用于前端展示下载，可以是图片、文本等
     * @param {String} [pathds_id]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async get_file_type_data(pathds_id, cancelSource, uploadProgress, downloadProgress) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let isHF = import.meta.env.VITE_USE_HF_ENDPOINT === 'true'
            let options = {
                method: 'get',
                url: isHF ? '/api/hf/viewer/rows' : dfApiPrefix + '/datasets/file_type_sample/' + pathds_id + '',
                data: {},
                params: isHF ? { dataset: pathds_id, config: "default", split: "default", offset: 0, length: 1 } : {},
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        if (isHF) {
                            let mapped_data = res.data.rows.map(r => r.row)
                            let data_str = JSON.stringify(mapped_data)
                            resolve({ success: true, code: 200, data: data_str })
                            return { success: true, code: 200, data: data_str }
                        } else {
                            resolve(res.data)
                            return res.data
                        }
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 获取指定数据集的文件预览内容，支持json、jsonl和parquet格式
     * @param {String} [pathds_id]
     * @param {Number} [num_lines]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async get_dataset_preview(
        pathds_id,
        num_lines,
        cancelSource,
        uploadProgress,
        downloadProgress
    ) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let isHF = import.meta.env.VITE_USE_HF_ENDPOINT === 'true'
            let options = {
                method: 'get',
                url: isHF ? '/api/hf/viewer/rows' : dfApiPrefix + '/datasets/preview/' + pathds_id + '',
                data: {},
                params: isHF ? { dataset: pathds_id, config: "default", split: "default", offset: 0, length: num_lines } : { num_lines },
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        if (isHF) {
                            let mapped_data = res.data.rows.map(r => r.row)
                            resolve({ success: true, code: 200, data: mapped_data })
                            return { success: true, code: 200, data: mapped_data }
                        } else {
                            resolve(res.data)
                            return res.data
                        }
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 获取指定数据集的列名，支持json、jsonl和parquet格式
     * @param {String} [pathds_id]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async get_dataset_columns(pathds_id, cancelSource, uploadProgress, downloadProgress) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let isHF = import.meta.env.VITE_USE_HF_ENDPOINT === 'true'
            let options = {
                method: 'get',
                url: isHF ? '/api/hf/viewer/info' : dfApiPrefix + '/datasets/columns/' + pathds_id + '',
                data: {},
                params: isHF ? { dataset: pathds_id, config: "default" } : {},
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        if (isHF) {
                            let features = res.data.dataset_info?.features || {}
                            resolve({ success: true, code: 200, data: Object.keys(features) })
                            return { success: true, code: 200, data: Object.keys(features) }
                        } else {
                            resolve(res.data)
                            return res.data
                        }
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 通过上传文件的形式添加数据集
     * @param {String} [name]
     * @param {UserModel.Body_upload_dataset} [body_upload_dataset]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async upload_dataset(
        name,
        body_upload_dataset,
        cancelSource,
        uploadProgress,
        downloadProgress
    ) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'post',
                url: dfApiPrefix + '/datasets/upload',
                data: body_upload_dataset,
                params: { name },
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }
}

// class datasets static method properties bind
/**
 * @description list_datasets url链接，包含baseURL
 */
datasets.list_datasets.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/datasets/`
/**
 * @description list_datasets url链接，不包含baseURL
 */
datasets.list_datasets.path = `${dfApiPrefix}/datasets/`
/**
 * @description register_dataset url链接，包含baseURL
 */
datasets.register_dataset.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/datasets/`
/**
 * @description register_dataset url链接，不包含baseURL
 */
datasets.register_dataset.path = `${dfApiPrefix}/datasets/`
/**
 * @description listDir url链接，包含baseURL
 */
datasets.listDir.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/datasets/list_dir`
/**
 * @description listDir url链接，不包含baseURL
 */
datasets.listDir.path = `${dfApiPrefix}/datasets/list_dir`
/**
 * @description get_dataset url链接，包含baseURL
 */
datasets.get_dataset.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/datasets/{ds_id}`
/**
 * @description get_dataset url链接，不包含baseURL
 */
datasets.get_dataset.path = `${dfApiPrefix}/datasets/{ds_id}`
/**
 * @description delete_dataset url链接，包含baseURL
 */
datasets.delete_dataset.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/datasets/{ds_id}`
/**
 * @description delete_dataset url链接，不包含baseURL
 */
datasets.delete_dataset.path = `${dfApiPrefix}/datasets/{ds_id}`
/**
 * @description get_pandas_data url链接，包含baseURL
 */
datasets.get_pandas_data.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/datasets/pandas_type_sample/{ds_id}`
/**
 * @description get_pandas_data url链接，不包含baseURL
 */
datasets.get_pandas_data.path = `${dfApiPrefix}/datasets/pandas_type_sample/{ds_id}`
/**
 * @description get_file_type_data url链接，包含baseURL
 */
datasets.get_file_type_data.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/datasets/file_type_sample/{ds_id}`
/**
 * @description get_file_type_data url链接，不包含baseURL
 */
datasets.get_file_type_data.path = `${dfApiPrefix}/datasets/file_type_sample/{ds_id}`
/**
 * @description get_dataset_preview url链接，包含baseURL
 */
datasets.get_dataset_preview.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/datasets/preview/{ds_id}`
/**
 * @description get_dataset_preview url链接，不包含baseURL
 */
datasets.get_dataset_preview.path = `${dfApiPrefix}/datasets/preview/{ds_id}`
/**
 * @description get_dataset_columns url链接，包含baseURL
 */
datasets.get_dataset_columns.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/datasets/columns/{ds_id}`
/**
 * @description get_dataset_columns url链接，不包含baseURL
 */
datasets.get_dataset_columns.path = `${dfApiPrefix}/datasets/columns/{ds_id}`
/**
 * @description upload_dataset url链接，包含baseURL
 */
datasets.upload_dataset.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/datasets/upload`
/**
 * @description upload_dataset url链接，不包含baseURL
 */
datasets.upload_dataset.path = `${dfApiPrefix}/datasets/upload`

export class operators {
    /**
     * @summary Return list of registered operators (simplified)
     * @param {String} [lang]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async list_operators(lang, cancelSource, uploadProgress, downloadProgress) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'get',
                url: dfApiPrefix + '/operators/',
                data: {},
                params: { lang },
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary Return all operator details (generated on first scan, then read from cache)
     * @param {String} [lang]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async list_operators_details(lang, cancelSource, uploadProgress, downloadProgress) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'get',
                url: dfApiPrefix + '/operators/details',
                data: {},
                params: { lang },
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary Get single operator details by name
     * @param {String} [pathop_name]
     * @param {String} [lang]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async get_operator_detail_by_name(
        pathop_name,
        lang,
        cancelSource,
        uploadProgress,
        downloadProgress
    ) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'get',
                url: dfApiPrefix + '/operators/details/' + pathop_name + '',
                data: {},
                params: { lang },
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }
}

// class operators static method properties bind
/**
 * @description list_operators url链接，包含baseURL
 */
operators.list_operators.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/operators/`
/**
 * @description list_operators url链接，不包含baseURL
 */
operators.list_operators.path = `${dfApiPrefix}/operators/`
/**
 * @description list_operators_details url链接，包含baseURL
 */
operators.list_operators_details.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/operators/details`
/**
 * @description list_operators_details url链接，不包含baseURL
 */
operators.list_operators_details.path = `${dfApiPrefix}/operators/details`
/**
 * @description get_operator_detail_by_name url链接，包含baseURL
 */
operators.get_operator_detail_by_name.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/operators/details/{op_name}`
/**
 * @description get_operator_detail_by_name url链接，不包含baseURL
 */
operators.get_operator_detail_by_name.path = `${dfApiPrefix}/operators/details/{op_name}`

export class tasks {
    /**
     * @summary 列出所有Pipeline执行记录
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async list_executions(cancelSource, uploadProgress, downloadProgress) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'get',
                url: dfApiPrefix + '/tasks/executions',
                data: {},
                params: {},
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 查询Pipeline执行状态（算子粒度）
     * @param {String} [pathtask_id]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async get_execution_status(pathtask_id, cancelSource, uploadProgress, downloadProgress) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'get',
                url: dfApiPrefix + '/tasks/execution/' + pathtask_id + '/status',
                data: {},
                params: {},
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 查询任务执行结果
     * @param {String} [pathtask_id]
     * @param {Number} [step]
     * @param {Number} [limit]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async get_task_result(
        pathtask_id,
        step,
        limit,
        cancelSource,
        uploadProgress,
        downloadProgress
    ) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'get',
                url: dfApiPrefix + '/tasks/execution/' + pathtask_id + '/result',
                data: {},
                params: { step, limit },
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 获取任务日志
     * @param {String} [pathtask_id]
     * @param {String} [operator_name] 算子名称
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async get_execution_log(
        pathtask_id,
        operator_name,
        cancelSource,
        uploadProgress,
        downloadProgress
    ) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'get',
                url: dfApiPrefix + '/tasks/execution/' + pathtask_id + '/log',
                data: {},
                params: { operator_name },
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 下载任务执行结果文件,step从0开始计数，想请求第一个算子传step=0
     * @param {String} [pathtask_id]
     * @param {Number} [step]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async download_task_result(
        pathtask_id,
        step,
        cancelSource,
        uploadProgress,
        downloadProgress
    ) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'get',
                url: dfApiPrefix + '/tasks/execution/' + pathtask_id + '/download',
                data: {},
                params: { step },
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 执行Pipeline
     * @param {undefined} [pipeline_id]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async execute_pipeline(pipeline_id, cancelSource, uploadProgress, downloadProgress) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'post',
                url: dfApiPrefix + '/tasks/execute',
                data: {},
                params: { pipeline_id },
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 异步执行Pipeline（使用Ray）
     * @param {String} [pipeline_id]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async execute_pipeline_async(
        pipeline_id,
        cancelSource,
        uploadProgress,
        downloadProgress
    ) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'post',
                url: dfApiPrefix + '/tasks/execute-async',
                data: {},
                params: { pipeline_id },
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 终止Pipeline执行
     * @param {String} [pathtask_id]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async kill_execution(pathtask_id, cancelSource, uploadProgress, downloadProgress) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'post',
                url: dfApiPrefix + '/tasks/execution/' + pathtask_id + '/kill',
                data: {},
                params: {},
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }
}

// class tasks static method properties bind
/**
 * @description list_executions url链接，包含baseURL
 */
tasks.list_executions.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/tasks/executions`
/**
 * @description list_executions url链接，不包含baseURL
 */
tasks.list_executions.path = `${dfApiPrefix}/tasks/executions`
/**
 * @description get_execution_status url链接，包含baseURL
 */
tasks.get_execution_status.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/tasks/execution/{task_id}/status`
/**
 * @description get_execution_status url链接，不包含baseURL
 */
tasks.get_execution_status.path = `${dfApiPrefix}/tasks/execution/{task_id}/status`
/**
 * @description get_task_result url链接，包含baseURL
 */
tasks.get_task_result.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/tasks/execution/{task_id}/result`
/**
 * @description get_task_result url链接，不包含baseURL
 */
tasks.get_task_result.path = `${dfApiPrefix}/tasks/execution/{task_id}/result`
/**
 * @description get_execution_log url链接，包含baseURL
 */
tasks.get_execution_log.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/tasks/execution/{task_id}/log`
/**
 * @description get_execution_log url链接，不包含baseURL
 */
tasks.get_execution_log.path = `${dfApiPrefix}/tasks/execution/{task_id}/log`
/**
 * @description download_task_result url链接，包含baseURL
 */
tasks.download_task_result.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/tasks/execution/{task_id}/download`
/**
 * @description download_task_result url链接，不包含baseURL
 */
tasks.download_task_result.path = `${dfApiPrefix}/tasks/execution/{task_id}/download`
/**
 * @description execute_pipeline url链接，包含baseURL
 */
tasks.execute_pipeline.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/tasks/execute`
/**
 * @description execute_pipeline url链接，不包含baseURL
 */
tasks.execute_pipeline.path = `${dfApiPrefix}/tasks/execute`
/**
 * @description execute_pipeline_async url链接，包含baseURL
 */
tasks.execute_pipeline_async.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/tasks/execute-async`
/**
 * @description execute_pipeline_async url链接，不包含baseURL
 */
tasks.execute_pipeline_async.path = `${dfApiPrefix}/tasks/execute-async`
/**
 * @description kill_execution url链接，包含baseURL
 */
tasks.kill_execution.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/tasks/execution/{task_id}/kill`
/**
 * @description kill_execution url链接，不包含baseURL
 */
tasks.kill_execution.path = `${dfApiPrefix}/tasks/execution/{task_id}/kill`

export class pipelines {
    /**
     * @summary 返回所有注册的Pipeline列表
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async list_pipelines(cancelSource, uploadProgress, downloadProgress) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'get',
                url: dfApiPrefix + '/pipelines/',
                data: {},
                params: {},
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 创建一个新的Pipeline
     * @param {UserModel.PipelineIn} [pipelinein]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async create_pipeline(pipelinein, cancelSource, uploadProgress, downloadProgress) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'post',
                url: dfApiPrefix + '/pipelines/',
                data: pipelinein,
                params: {},
                headers: {
                    'Content-Type': 'application/json'
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 返回所有预置(template) Pipeline列表
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async list_template_pipelines(cancelSource, uploadProgress, downloadProgress) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'get',
                url: dfApiPrefix + '/pipelines/templates',
                data: {},
                params: {},
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 根据ID获取Pipeline详情
     * @param {String} [pathpipeline_id]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async get_pipeline(pathpipeline_id, cancelSource, uploadProgress, downloadProgress) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'get',
                url: dfApiPrefix + '/pipelines/' + pathpipeline_id + '',
                data: {},
                params: {},
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 更新指定的Pipeline
     * @param {String} [pathpipeline_id]
     * @param {UserModel.PipelineUpdateIn} [pipelineupdatein]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async update_pipeline(
        pathpipeline_id,
        pipelineupdatein,
        cancelSource,
        uploadProgress,
        downloadProgress
    ) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'put',
                url: dfApiPrefix + '/pipelines/' + pathpipeline_id + '',
                data: pipelineupdatein,
                params: {},
                headers: {
                    'Content-Type': 'application/json'
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 删除指定的Pipeline
     * @param {String} [pathpipeline_id]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async delete_pipeline(pathpipeline_id, cancelSource, uploadProgress, downloadProgress) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'delete',
                url: dfApiPrefix + '/pipelines/' + pathpipeline_id + '',
                data: {},
                params: {},
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }
}

// class pipelines static method properties bind
/**
 * @description list_pipelines url链接，包含baseURL
 */
pipelines.list_pipelines.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/pipelines/`
/**
 * @description list_pipelines url链接，不包含baseURL
 */
pipelines.list_pipelines.path = `${dfApiPrefix}/pipelines/`
/**
 * @description create_pipeline url链接，包含baseURL
 */
pipelines.create_pipeline.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/pipelines/`
/**
 * @description create_pipeline url链接，不包含baseURL
 */
pipelines.create_pipeline.path = `${dfApiPrefix}/pipelines/`
/**
 * @description list_template_pipelines url链接，包含baseURL
 */
pipelines.list_template_pipelines.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/pipelines/templates`
/**
 * @description list_template_pipelines url链接，不包含baseURL
 */
pipelines.list_template_pipelines.path = `${dfApiPrefix}/pipelines/templates`
/**
 * @description get_pipeline url链接，包含baseURL
 */
pipelines.get_pipeline.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/pipelines/{pipeline_id}`
/**
 * @description get_pipeline url链接，不包含baseURL
 */
pipelines.get_pipeline.path = `${dfApiPrefix}/pipelines/{pipeline_id}`
/**
 * @description update_pipeline url链接，包含baseURL
 */
pipelines.update_pipeline.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/pipelines/{pipeline_id}`
/**
 * @description update_pipeline url链接，不包含baseURL
 */
pipelines.update_pipeline.path = `${dfApiPrefix}/pipelines/{pipeline_id}`
/**
 * @description delete_pipeline url链接，包含baseURL
 */
pipelines.delete_pipeline.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/pipelines/{pipeline_id}`
/**
 * @description delete_pipeline url链接，不包含baseURL
 */
pipelines.delete_pipeline.path = `${dfApiPrefix}/pipelines/{pipeline_id}`

export class prompts {
    /**
     * @summary 查看所有算子及其对应的 Prompt 列表
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async get_operator_prompt_mapping_api_v1_prompts_operator_mapping_get(
        cancelSource,
        uploadProgress,
        downloadProgress
    ) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'get',
                url: dfApiPrefix + '/prompts/operator-mapping',
                data: {},
                params: {},
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 查看所有 prompt 的信息（operator, class string, category）
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async get_prompt_info_api_v1_prompts_prompt_info_get(
        cancelSource,
        uploadProgress,
        downloadProgress
    ) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'get',
                url: dfApiPrefix + '/prompts/prompt-info',
                data: {},
                params: {},
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 根据 Prompt 名称获取 Prompt 信息
     * @param {String} [pathprompt_name]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async get_prompt_info_api_v1_prompts_prompt_info__prompt_name__get(
        pathprompt_name,
        cancelSource,
        uploadProgress,
        downloadProgress
    ) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'get',
                url: dfApiPrefix + '/prompts/prompt-info/' + pathprompt_name + '',
                data: {},
                params: {},
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 根据算子名称获取对应的 Prompt 列表
     * @param {String} [pathoperator_name]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async get_prompts_api_v1_prompts__operator_name__get(
        pathoperator_name,
        cancelSource,
        uploadProgress,
        downloadProgress
    ) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'get',
                url: dfApiPrefix + '/prompts/' + pathoperator_name + '',
                data: {},
                params: {},
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 根据 Prompt 名称返回 Prompt 类的源码
     * @param {String} [pathprompt_name]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async get_prompt_source_api_v1_prompts_source__prompt_name__get(
        pathprompt_name,
        cancelSource,
        uploadProgress,
        downloadProgress
    ) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'get',
                url: dfApiPrefix + '/prompts/source/' + pathprompt_name + '',
                data: {},
                params: {},
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }
}

// class prompts static method properties bind
/**
 * @description get_operator_prompt_mapping_api_v1_prompts_operator_mapping_get url链接，包含baseURL
 */
prompts.get_operator_prompt_mapping_api_v1_prompts_operator_mapping_get.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/prompts/operator-mapping`
/**
 * @description get_operator_prompt_mapping_api_v1_prompts_operator_mapping_get url链接，不包含baseURL
 */
prompts.get_operator_prompt_mapping_api_v1_prompts_operator_mapping_get.path = `${dfApiPrefix}/prompts/operator-mapping`
/**
 * @description get_prompt_info_api_v1_prompts_prompt_info_get url链接，包含baseURL
 */
prompts.get_prompt_info_api_v1_prompts_prompt_info_get.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/prompts/prompt-info`
/**
 * @description get_prompt_info_api_v1_prompts_prompt_info_get url链接，不包含baseURL
 */
prompts.get_prompt_info_api_v1_prompts_prompt_info_get.path = `${dfApiPrefix}/prompts/prompt-info`
/**
 * @description get_prompt_info_api_v1_prompts_prompt_info__prompt_name__get url链接，包含baseURL
 */
prompts.get_prompt_info_api_v1_prompts_prompt_info__prompt_name__get.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/prompts/prompt-info/{prompt_name}`
/**
 * @description get_prompt_info_api_v1_prompts_prompt_info__prompt_name__get url链接，不包含baseURL
 */
prompts.get_prompt_info_api_v1_prompts_prompt_info__prompt_name__get.path = `${dfApiPrefix}/prompts/prompt-info/{prompt_name}`
/**
 * @description get_prompts_api_v1_prompts__operator_name__get url链接，包含baseURL
 */
prompts.get_prompts_api_v1_prompts__operator_name__get.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/prompts/{operator_name}`
/**
 * @description get_prompts_api_v1_prompts__operator_name__get url链接，不包含baseURL
 */
prompts.get_prompts_api_v1_prompts__operator_name__get.path = `${dfApiPrefix}/prompts/{operator_name}`
/**
 * @description get_prompt_source_api_v1_prompts_source__prompt_name__get url链接，包含baseURL
 */
prompts.get_prompt_source_api_v1_prompts_source__prompt_name__get.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/prompts/source/{prompt_name}`
/**
 * @description get_prompt_source_api_v1_prompts_source__prompt_name__get url链接，不包含baseURL
 */
prompts.get_prompt_source_api_v1_prompts_source__prompt_name__get.path = `${dfApiPrefix}/prompts/source/{prompt_name}`

export class serving {
    /**
     * @summary List Serving Instances
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async list_serving_instances_api_v1_serving__get(
        cancelSource,
        uploadProgress,
        downloadProgress
    ) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'get',
                url: dfApiPrefix + '/serving/',
                data: {},
                params: {},
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 创建新的 Serving 实例
     * @param {String} [name]
     * @param {String} [cls_name]
     * @param {array} [array]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async create_serving_instance(
        name,
        cls_name,
        array,
        cancelSource,
        uploadProgress,
        downloadProgress
    ) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'post',
                url: dfApiPrefix + '/serving/',
                data: array,
                params: { name, cls_name },
                headers: {
                    'Content-Type': 'application/json'
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 获取所有可用Serving类定义
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async list_serving_classes(cancelSource, uploadProgress, downloadProgress) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'get',
                url: dfApiPrefix + '/serving/classes',
                data: {},
                params: {},
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 获取指定 Serving 实例的详细信息
     * @param {String} [pathid]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async get_serving_detail(pathid, cancelSource, uploadProgress, downloadProgress) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'get',
                url: dfApiPrefix + '/serving/' + pathid + '',
                data: {},
                params: {},
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 更新 Serving 实例
     * @param {String} [pathid]
     * @param {UserModel.ServingUpdateSchema} [servingupdateschema]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async update_serving_instance(
        pathid,
        servingupdateschema,
        cancelSource,
        uploadProgress,
        downloadProgress
    ) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'put',
                url: dfApiPrefix + '/serving/' + pathid + '',
                data: servingupdateschema,
                params: {},
                headers: {
                    'Content-Type': 'application/json'
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 删除 Serving 实例
     * @param {String} [pathid]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async delete_serving_instance(pathid, cancelSource, uploadProgress, downloadProgress) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'delete',
                url: dfApiPrefix + '/serving/' + pathid + '',
                data: {},
                params: {},
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 测试指定 Serving 实例的响应
     * @param {String} [pathid]
     * @param {UserModel.ServingTestSchema} [servingtestschema]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async test_serving_instance(
        pathid,
        servingtestschema,
        cancelSource,
        uploadProgress,
        downloadProgress
    ) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'post',
                url: dfApiPrefix + '/serving/' + pathid + '/test',
                data: servingtestschema,
                params: {},
                headers: {
                    'Content-Type': 'application/json'
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }
}

// class serving static method properties bind
/**
 * @description list_serving_instances_api_v1_serving__get url链接，包含baseURL
 */
serving.list_serving_instances_api_v1_serving__get.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/serving/`
/**
 * @description list_serving_instances_api_v1_serving__get url链接，不包含baseURL
 */
serving.list_serving_instances_api_v1_serving__get.path = `${dfApiPrefix}/serving/`
/**
 * @description create_serving_instance url链接，包含baseURL
 */
serving.create_serving_instance.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/serving/`
/**
 * @description create_serving_instance url链接，不包含baseURL
 */
serving.create_serving_instance.path = `${dfApiPrefix}/serving/`
/**
 * @description list_serving_classes url链接，包含baseURL
 */
serving.list_serving_classes.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/serving/classes`
/**
 * @description list_serving_classes url链接，不包含baseURL
 */
serving.list_serving_classes.path = `${dfApiPrefix}/serving/classes`
/**
 * @description get_serving_detail url链接，包含baseURL
 */
serving.get_serving_detail.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/serving/{id}`
/**
 * @description get_serving_detail url链接，不包含baseURL
 */
serving.get_serving_detail.path = `${dfApiPrefix}/serving/{id}`
/**
 * @description update_serving_instance url链接，包含baseURL
 */
serving.update_serving_instance.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/serving/{id}`
/**
 * @description update_serving_instance url链接，不包含baseURL
 */
serving.update_serving_instance.path = `${dfApiPrefix}/serving/{id}`
/**
 * @description delete_serving_instance url链接，包含baseURL
 */
serving.delete_serving_instance.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/serving/{id}`
/**
 * @description delete_serving_instance url链接，不包含baseURL
 */
serving.delete_serving_instance.path = `${dfApiPrefix}/serving/{id}`
/**
 * @description test_serving_instance url链接，包含baseURL
 */
serving.test_serving_instance.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/serving/{id}/test`
/**
 * @description test_serving_instance url链接，不包含baseURL
 */
serving.test_serving_instance.path = `${dfApiPrefix}/serving/{id}/test`

export class text2sql_database {
    /**
     * @summary 列出所有已上传的sqlite数据库
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async list_databases(cancelSource, uploadProgress, downloadProgress) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'get',
                url: dfApiPrefix + '/text2sql_database/',
                data: {},
                params: {},
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 获取指定db详情
     * @param {String} [pathdb_id]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async get_database_detail(pathdb_id, cancelSource, uploadProgress, downloadProgress) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'get',
                url: dfApiPrefix + '/text2sql_database/' + pathdb_id + '',
                data: {},
                params: {},
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 删除数据库
     * @param {String} [pathdb_id]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async delete_database(pathdb_id, cancelSource, uploadProgress, downloadProgress) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'delete',
                url: dfApiPrefix + '/text2sql_database/' + pathdb_id + '',
                data: {},
                params: {},
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 上传一个sqlite数据库文件并注册
     * @param {UserModel.Body_upload_sqlite_database} [body_upload_sqlite_database]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async upload_sqlite_database(
        body_upload_sqlite_database,
        cancelSource,
        uploadProgress,
        downloadProgress
    ) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'post',
                url: dfApiPrefix + '/text2sql_database/upload',
                data: body_upload_sqlite_database,
                params: {},
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }
}

// class text2sql_database static method properties bind
/**
 * @description list_databases url链接，包含baseURL
 */
text2sql_database.list_databases.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/text2sql_database/`
/**
 * @description list_databases url链接，不包含baseURL
 */
text2sql_database.list_databases.path = `${dfApiPrefix}/text2sql_database/`
/**
 * @description get_database_detail url链接，包含baseURL
 */
text2sql_database.get_database_detail.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/text2sql_database/{db_id}`
/**
 * @description get_database_detail url链接，不包含baseURL
 */
text2sql_database.get_database_detail.path = `${dfApiPrefix}/text2sql_database/{db_id}`
/**
 * @description delete_database url链接，包含baseURL
 */
text2sql_database.delete_database.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/text2sql_database/{db_id}`
/**
 * @description delete_database url链接，不包含baseURL
 */
text2sql_database.delete_database.path = `${dfApiPrefix}/text2sql_database/{db_id}`
/**
 * @description upload_sqlite_database url链接，包含baseURL
 */
text2sql_database.upload_sqlite_database.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/text2sql_database/upload`
/**
 * @description upload_sqlite_database url链接，不包含baseURL
 */
text2sql_database.upload_sqlite_database.path = `${dfApiPrefix}/text2sql_database/upload`

export class text2sql_database_manager {
    /**
     * @summary 列出所有DatabaseManager配置
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async list_text2sql_database_managers(cancelSource, uploadProgress, downloadProgress) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'get',
                url: dfApiPrefix + '/text2sql_database_manager/',
                data: {},
                params: {},
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 创建新的DatabaseManager
     * @param {UserModel.Text2SQLDatabaseManagerCreateSchema} [text2sqldatabasemanagercreateschema]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async create_text2sql_database_manager(
        text2sqldatabasemanagercreateschema,
        cancelSource,
        uploadProgress,
        downloadProgress
    ) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'post',
                url: dfApiPrefix + '/text2sql_database_manager/',
                data: text2sqldatabasemanagercreateschema,
                params: {},
                headers: {
                    'Content-Type': 'application/json'
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 获取所有可用DatabaseManager类定义
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async list_text2sql_database_manager_classes(
        cancelSource,
        uploadProgress,
        downloadProgress
    ) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'get',
                url: dfApiPrefix + '/text2sql_database_manager/classes',
                data: {},
                params: {},
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 获取指定DatabaseManager配置详情
     * @param {String} [pathmgr_id]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async get_text2sql_database_manager_detail(
        pathmgr_id,
        cancelSource,
        uploadProgress,
        downloadProgress
    ) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'get',
                url: dfApiPrefix + '/text2sql_database_manager/' + pathmgr_id + '',
                data: {},
                params: {},
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 更新DatabaseManager
     * @param {String} [pathmgr_id]
     * @param {UserModel.Text2SQLDatabaseManagerUpdateSchema} [text2sqldatabasemanagerupdateschema]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async update_text2sql_database_manager(
        pathmgr_id,
        text2sqldatabasemanagerupdateschema,
        cancelSource,
        uploadProgress,
        downloadProgress
    ) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'put',
                url: dfApiPrefix + '/text2sql_database_manager/' + pathmgr_id + '',
                data: text2sqldatabasemanagerupdateschema,
                params: {},
                headers: {
                    'Content-Type': 'application/json'
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 删除DatabaseManager
     * @param {String} [pathmgr_id]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async delete_text2sql_database_manager(
        pathmgr_id,
        cancelSource,
        uploadProgress,
        downloadProgress
    ) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'delete',
                url: dfApiPrefix + '/text2sql_database_manager/' + pathmgr_id + '',
                data: {},
                params: {},
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }
}

// class text2sql_database_manager static method properties bind
/**
 * @description list_text2sql_database_managers url链接，包含baseURL
 */
text2sql_database_manager.list_text2sql_database_managers.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/text2sql_database_manager/`
/**
 * @description list_text2sql_database_managers url链接，不包含baseURL
 */
text2sql_database_manager.list_text2sql_database_managers.path = `${dfApiPrefix}/text2sql_database_manager/`
/**
 * @description create_text2sql_database_manager url链接，包含baseURL
 */
text2sql_database_manager.create_text2sql_database_manager.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/text2sql_database_manager/`
/**
 * @description create_text2sql_database_manager url链接，不包含baseURL
 */
text2sql_database_manager.create_text2sql_database_manager.path = `${dfApiPrefix}/text2sql_database_manager/`
/**
 * @description list_text2sql_database_manager_classes url链接，包含baseURL
 */
text2sql_database_manager.list_text2sql_database_manager_classes.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/text2sql_database_manager/classes`
/**
 * @description list_text2sql_database_manager_classes url链接，不包含baseURL
 */
text2sql_database_manager.list_text2sql_database_manager_classes.path = `${dfApiPrefix}/text2sql_database_manager/classes`
/**
 * @description get_text2sql_database_manager_detail url链接，包含baseURL
 */
text2sql_database_manager.get_text2sql_database_manager_detail.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/text2sql_database_manager/{mgr_id}`
/**
 * @description get_text2sql_database_manager_detail url链接，不包含baseURL
 */
text2sql_database_manager.get_text2sql_database_manager_detail.path = `${dfApiPrefix}/text2sql_database_manager/{mgr_id}`
/**
 * @description update_text2sql_database_manager url链接，包含baseURL
 */
text2sql_database_manager.update_text2sql_database_manager.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/text2sql_database_manager/{mgr_id}`
/**
 * @description update_text2sql_database_manager url链接，不包含baseURL
 */
text2sql_database_manager.update_text2sql_database_manager.path = `${dfApiPrefix}/text2sql_database_manager/{mgr_id}`
/**
 * @description delete_text2sql_database_manager url链接，包含baseURL
 */
text2sql_database_manager.delete_text2sql_database_manager.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/text2sql_database_manager/{mgr_id}`
/**
 * @description delete_text2sql_database_manager url链接，不包含baseURL
 */
text2sql_database_manager.delete_text2sql_database_manager.path = `${dfApiPrefix}/text2sql_database_manager/{mgr_id}`

export class preferences {
    /**
     * @summary 获取当前全局用户偏好配置
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async get_preferences_api_v1_preferences__get(
        cancelSource,
        uploadProgress,
        downloadProgress
    ) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'get',
                url: dfApiPrefix + '/preferences/',
                data: {},
                params: {},
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * @summary 更新全局用户偏好配置（直接覆盖）
     * @param {object} [object]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async set_preferences_api_v1_preferences__post(
        object,
        cancelSource,
        uploadProgress,
        downloadProgress
    ) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'post',
                url: dfApiPrefix + '/preferences/',
                data: object,
                params: {},
                headers: {
                    'Content-Type': 'application/json'
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }
}

// class preferences static method properties bind
/**
 * @description get_preferences_api_v1_preferences__get url链接，包含baseURL
 */
preferences.get_preferences_api_v1_preferences__get.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/preferences/`
/**
 * @description get_preferences_api_v1_preferences__get url链接，不包含baseURL
 */
preferences.get_preferences_api_v1_preferences__get.path = `${dfApiPrefix}/preferences/`
/**
 * @description set_preferences_api_v1_preferences__post url链接，包含baseURL
 */
preferences.set_preferences_api_v1_preferences__post.fullPath = `${axios.defaults.baseURL}${dfApiPrefix}/preferences/`
/**
 * @description set_preferences_api_v1_preferences__post url链接，不包含baseURL
 */
preferences.set_preferences_api_v1_preferences__post.path = `${dfApiPrefix}/preferences/`

export class common {
    /**
     * @summary Spa Fallback
     * @param {String} [pathfull_path]
     * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
     * @param {Function} [uploadProgress] 上传回调函数
     * @param {Function} [downloadProgress] 下载回调函数
     */
    static async spa_fallback_ui__full_path__get(
        pathfull_path,
        cancelSource,
        uploadProgress,
        downloadProgress
    ) {
        return await new Promise((resolve, reject) => {
            let responseType = 'json'
            let options = {
                method: 'get',
                url: '/ui/' + pathfull_path + '',
                data: {},
                params: {},
                headers: {
                    'Content-Type': ''
                },
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress
            }
            // support wechat mini program
            if (cancelSource != undefined) {
                options.cancelToken = cancelSource.token
            }
            if (responseType != 'json') {
                options.responseType = responseType
            }
            axios(options)
                .then((res) => {
                    if (res.config.responseType == 'blob') {
                        resolve(
                            new Blob([res.data], {
                                type: res.headers['content-type'].split(';')[0]
                            })
                        )
                    } else {
                        resolve(res.data)
                        return res.data
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.data) reject(err.response.data)
                        else reject(err.response)
                    } else {
                        reject(err)
                    }
                })
        })
    }
}

// class common static method properties bind
/**
 * @description spa_fallback_ui__full_path__get url链接，包含baseURL
 */
common.spa_fallback_ui__full_path__get.fullPath = `${axios.defaults.baseURL}/ui/{full_path}`
/**
 * @description spa_fallback_ui__full_path__get url链接，不包含baseURL
 */
common.spa_fallback_ui__full_path__get.path = `/ui/{full_path}`
