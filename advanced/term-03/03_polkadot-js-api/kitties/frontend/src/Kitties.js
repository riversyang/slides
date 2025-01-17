import React, { useEffect, useState } from 'react'
import { Form, Grid } from 'semantic-ui-react'

import { useSubstrate } from './substrate-lib'
import { TxButton } from './substrate-lib/components'

import KittyCards from './KittyCards'

export default function Kitties (props) {
  const { api, keyring } = useSubstrate()
  const { accountPair } = props

  const [kitties, setKitties] = useState([])
  const [status, setStatus] = useState('')

  const [count, setCount] = useState(0)
  const [dnas, setDnas] = useState([])
  const [owners, setOwners] = useState([])

  const fetchKitties = () => {
    // TODO: 在这里调用 `api.query.kittiesModule.*` 函数去取得猫咪的信息。
    // 你需要取得：
    //   - 共有多少只猫咪
    //   - 每只猫咪的主人是谁
    //   - 每只猫咪的 DNA 是什么，用来组合出它的形态
    let unsubscribe1
    let unsubscribe2
    let unsubscribe3
    api.query.kittiesModule.kittiesCount(count => {
      setCount(count)
      const indexes = []
      for (let index = 0; index < count; index++) {
        indexes.push(index)
      }
      api.query.kittiesModule.kitties.multi(indexes, results => {
        const kittyDnas = []
        results.forEach(element => {
          if (element.isSome) {
            kittyDnas.push(element.unwrap())
          }
        })
        setDnas(kittyDnas)
      }).then(unsub => {
        unsubscribe2 = unsub
      }).catch(console.error)
      api.query.kittiesModule.owner.multi(indexes, results => {
        const kittyOwners = []
        results.forEach(element => {
          if (element.isSome) {
            kittyOwners.push(element.unwrap())
          }
        })
        setOwners(kittyOwners)
      }).then(unsub => {
        unsubscribe3 = unsub
      }).catch(console.error)
    }).then(unsub => {
      unsubscribe1 = unsub
    }).catch(console.error)
    return () => unsubscribe1 && unsubscribe2 && unsubscribe3
  }

  const populateKitties = () => {
    // TODO: 在这里添加额外的逻辑。你需要组成这样的数组结构：
    //  ```javascript
    //  const kitties = [{
    //    id: 0,
    //    dna: ...,
    //    owner: ...
    //  }, { id: ..., dna: ..., owner: ... }]
    //  ```
    // 这个 kitties 会传入 <KittyCards/> 然后对每只猫咪进行处理
    const kitties = []
    for (let index = 0; index < count; index++) {
      kitties.push({
        id: index,
        dna: dnas[index],
        owner: owners[index]
      })
    }
    setKitties(kitties)
  }

  useEffect(fetchKitties, [api, keyring])
  useEffect(populateKitties, [count, dnas, owners])

  return <Grid.Column width={16}>
    <h1>小毛孩</h1>
    <KittyCards kitties={kitties} accountPair={accountPair} setStatus={setStatus} />
    <Form style={{ margin: '1em 0' }}>
      <Form.Field style={{ textAlign: 'center' }}>
        <TxButton
          accountPair={accountPair} label='创建小毛孩' type='SIGNED-TX' setStatus={setStatus}
          attrs={{
            palletRpc: 'kittiesModule',
            callable: 'create',
            inputParams: [],
            paramFields: []
          }}
        />
      </Form.Field>
    </Form>
    <div style={{ overflowWrap: 'break-word' }}>{status}</div>
  </Grid.Column>
}
