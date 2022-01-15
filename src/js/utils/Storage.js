import { getSongList } from '../background/DataProcess'
import { v4 as uuidv4 } from 'uuid';
import { fetchPlayUrlPromise } from '../utils/Data2'

const INITIAL_PLAYLIST = 'BV1wr4y1v7TA'

export const initFavLists = async (setFavLists) => {
    chrome.storage.local.get(['MyFavList'], function (result) {
        console.log(result);
        if (Object.keys(result).length != 0) {
            initWithStorage(setFavLists, result["MyFavList"])
        }
        else {
            chrome.storage.local.set({ 'MyFavList': [] }, async function () {
                initWithDefault(setFavLists)
            });
        }
    });
}

const initWithStorage = async (setFavLists, FavListIDs) => {
    chrome.storage.local.get(FavListIDs, function (result) {
        var FavLists = []
        var FavListsSorted = []
        // Sort result base on ID
        for (var [key, value] of Object.entries(result)) {
            value.songList.map((v) => v['musicSrc'] = () => { return fetchPlayUrlPromise(v.bvid, v.id) })
            FavLists.push(value)
            
        }
        FavListIDs.map((id) => {
            FavListsSorted.push(FavLists.find((v) => v.info.id == id))
        })
        console.log(FavListsSorted)
        setFavLists(FavListsSorted)
    })
}

const initWithDefault = async (setFavLists) => {

    const value = {
        songList: await getSongList(INITIAL_PLAYLIST),
        info: { title: '默认歌单1', id: ('FavList-' + uuidv4()) }
    }

    const value2 = {
        songList: await getSongList('BV1Ya411z7WL'),
        info: { title: '默认歌单2', id: ('FavList-' + uuidv4()) }
    }

    chrome.storage.local.set({ [value.info.id]: value, [value2.info.id]: value2 }, function () {
        console.log('key is set to ' + value.info.id);
        console.log('Value is set to ' + value);
        chrome.storage.local.set({ 'MyFavList': [value.info.id, value2.info.id] }, function () {
            setFavLists([value, value2])
        })
    });
}