import { ipfs, json, JSONValue } from '@graphprotocol/graph-ts'
import {
  Transfer as TransferEvent,
  Token as TokenContract
} from '../generated/Token/Token'
import {
  Token, User
} from '../generated/schema'

const ipfshash = "QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq"

export function handleTransfer(event: TransferEvent): void {
  /* load the token from the existing Graph Node */
  let token = Token.load(event.params.tokenId.toString())
  if (!token) {
    /* if the token does not yet exist, create it */
    token = new Token(event.params.tokenId.toString())
    token.tokenID = event.params.tokenId

    token.tokenURI = "/" + event.params.tokenId.toString() //+ ".json"
    token.ipfsURI = 'ipfs.io/ipfs/' + ipfshash + token.tokenURI

    /* combine the ipfs hash and the token ID to fetch the token metadata from IPFS */
    let metadata = ipfs.cat(ipfshash + token.tokenURI)
    if (metadata) {
      const value = json.fromBytes(metadata).toObject()
      if (value) {
        const attr_val = value.get('attributes')
        if (attr_val) {
          let attributes: JSONValue[]
          let atts = value.get('attributes')
          if (atts) {
            attributes = atts.toArray()
            for (let i = 0; i < attributes.length; i++) {
              let item = attributes[i].toObject()
              let tt: string
              let vv: string
              let t = item.get('trait_type')
              let v = item.get('value')
              if (t && v) {
                tt = t.toString()
                vv = v.toString()

                if (tt == "Mouth") {
                  token.mouth = vv
                }

                if (tt == "Eyes") {
                  token.eyes = vv
                }

                if (tt == "Background") {
                  token.background = vv
                }

                if (tt == "Hat") {
                  token.hat = vv
                }

                if (tt == "Clothes") {
                  token.clothes = vv
                }

                if (tt == "Fur") {
                  token.fur = vv
                }

                if (tt == "Earring") {
                  token.earring = vv
                }
              }

            }
          }

        }


      }
    }
  }
  token.updatedAtTimestamp = event.block.timestamp

  /* set or update the owner field and save the token to the Graph Node */
  token.owner = event.params.to.toHexString()
  token.save()

  /* if the user does not yet exist, create them */
  let user = User.load(event.params.to.toHexString())
  if (!user) {
    user = new User(event.params.to.toHexString())
    user.save()
  }
}