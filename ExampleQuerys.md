# Example Queries 

Get all token balances for a given account

```
{
  accounts(where:{id:"<given-account-id>"}) {
    id
    ERC1155balances {
      token {
        identifier
        uri
      }
      valueExact
    }
  }
}
```