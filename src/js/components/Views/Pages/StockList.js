import React from "react";
import request from "superagent";
import { Button, ButtonToolbar, Accordion, Panel, Table, PageHeader } from 'react-bootstrap';
import Sparkline from 'd3-react-sparkline';

var StockList = React.createClass({

  getInitialState: function() {
    return {selectedStockSymbol:"",
            selectedStockInfo:{},
            stocks:["AAPL", "XOM", "MSFT", "GOOGL", "GOOG", "WFC", "WMT",
            "GE", "PG", "JPM", "VZ", "KO", "PFE", "T", "ORCL", "BAC", "MMM",
            "ABT", "ABBV", "ATVI", "ADBE", "ADT", "AAP", "STT", "RVBD", "YHOO"],
            selectedStockHistorical:[],
            haveStockData:false}
  },

  removeSymbol: function(stockToRemove) {
    var stocks = this.state.stocks.filter(stock=>stock!=stockToRemove);
    this.setState({stocks:stocks});
  },

  getSymbolDetails: function(stock) {
    this.setState({selectedStockSymbol:stock, haveStockData:false});
    if(this.state.selectedStockInfo.symbol!==stock){
      request.get("/"+stock).send().end( function (error, resp, body) {
        if(!error && resp.statusCode ==200){
          console.log(JSON.stringify(resp.body));
          this.setState({selectedStockInfo:resp.body?resp.body:{}, haveStockData:true});
        }
        else{
          alert('Http request to yahoo threw error');
        }
      }.bind(this));

      request.get("/"+stock+"/historical").send().end(function (error, resp, body){
        if(!error && resp.statusCode==200){
          this.setState({selectedStockHistorical:{data:resp.body, stock:stock}});
        }
        else{
          console.log("error: ", error);
          alert("historical endpoint failed");
        }
      }.bind(this));
    }
    else{
      return;
    }
  },

  handleBuy: function(){
    event.preventDefault();
    var stocks = this.state.stocks.slice(0)
    stocks.push(this.refs.buySymbol.value.trim());
    this.setState({stocks:stocks});
    this.refs.buySymbol.value="";
  },

  render(){

    return (
      <div className = "Stocks">
        <div style={{ padding: 20, paddingTop:10 }}>
        <h3 style={{fontFamily:'Abril Fatface'}}>Stock List</h3>
        <input id = "stockInput" type="text" ref="buySymbol"></input>
        <Button id = "stockButton" type="submit" style={{marginLeft:'3px'}} onClick={this.handleBuy} bsSize="xsmall" bsStyle="success">Buy</Button>
        <h6 style={{fontFamily:'Abril Fatface'}}>Select:</h6><ButtonToolbar>
          {this.state.stocks.map(stock =>
            <Button id = "stocksButton" bsSize="small" style={{marginBottom:'2px'}} key={stock} onClick={()=>{this.getSymbolDetails(stock)}}><a className= {stock+"_ref"}>{stock}</a></Button>
          )}
        </ButtonToolbar>
        <br/>
        {
          !this.state.selectedStockInfo.price&&
          this.state.haveStockData&&
          this.state.stocks.filter(stock=>stock==this.state.selectedStockSymbol).length>0?(
          <div>
            <Button className = "sellButton" bsStyle="danger" bsSize="xsmall"
            onClick={()=>{this.removeSymbol(this.state.selectedStockSymbol)}}
            style={{marginBottom:'4px'}}><a className = "sellRef">Sell</a></Button>
            <h5>No Such Stock</h5>
        </div>):(
        this.state.stocks.map((stock, count) =>
        this.state.selectedStockInfo.symbol==stock?(
          <Panel className = "stock_header" header={stock} key={stock} style={{width:820, fontFamily:'Abril Fatface'}}>
              <div>
                <Button className = "sellButton" bsStyle="danger" bsSize="xsmall"
                  onClick={()=>{this.removeSymbol(stock)}}
                  style={{marginBottom:'4px'}}><a className = "sellRef">Sell</a></Button>
                <Table bordered style={{fontFamily:'Arial'}}>
                  <thead>
                    <tr>
                      <th className = "Issuer">Issuer</th>
                      <th className = "Symbol">Symbol</th>
                      <th className = "Price">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td id = "IssuerData" dangerouslySetInnerHTML={{__html: this.state.selectedStockInfo.issuer}}></td>
                      <td id = "SymbolData" >{this.state.selectedStockInfo.symbol}</td>
                      <td id = "PriceData" >{this.state.selectedStockInfo.price}</td>
                    </tr>
                  </tbody>
                </Table>
                {this.state.selectedStockHistorical.stock==stock&&this.state.selectedStockHistorical.data.length!=0?(
                  <Sparkline data={this.state.selectedStockHistorical.data}
                    width={785}
                    height={155}>
                  </Sparkline>):""}
                </div>
            </Panel>):""))}
          </div>
        </div>
        )
      }
    });

    export default StockList
