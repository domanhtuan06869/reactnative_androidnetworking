import React, { Component } from 'react';
//import react in our code.
import { Dimensions } from 'react-native';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Platform,RefreshControl,
  ActivityIndicator,Image,PermissionsAndroid
} from 'react-native';
//import all the components we are going to use.
import RNFetchBlob from 'rn-fetch-blob'
export async function request_storage_runtime_permission() {
 
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        'title': 'ReactNativeCode Storage Permission',
        'message': 'ReactNativeCode App needs access to your storage to download Photos.'
      }
    )
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
 
   //   Alert.alert("Storage Permission Granted.");
    }
    else {
 
     // Alert.alert("Storage Permission Not Granted");
 
    }
  } catch (err) {
    console.warn(err)
  }
}

export default class App extends Component {
  static navigationOptions = ({ navigation }) => ({
    header:(
      <View style={{  justifyContent:"space-between",
      flexDirection:"row",
      backgroundColor:'#2f95dc',
      paddingVertical:10,
      paddingHorizontal:20,}}>
          <Text> </Text>
          <Text style={{fontSize:20,marginTop:5,color:'white',}}>Trang chủ</Text>
          <Text> </Text>
      </View>
    ),
  })
  
  constructor() {

    super();
    this.state = {
      loading: true,url:'https://www.flickr.com/services/rest/?method=flickr.favorites.getList&api_key=258b6c19d93adac85aff5c0daf16634b&user_id=184495155%40N06&extras=views%2Cmedia%2Cpath_alias%2Curl_sq%2Curl_t%2Curl_s%2Curl_q%2Curl_m%2Curl_n%2Curl_z%2Curl_c%2Curl_l%2Curl_o&per_page=50&page=1&format=json&nojsoncallback=1',
      //Loading state used while loading the data for the first time
      serverData: [],
      urlpramas:null,
      isrefesh:false,
      //Data Source for the FlatList
      fetching_from_server: false,
      //Loading state used while loading more data
    };
    this.offset = 0;
    //Index of the offset to load from web API
  }
 
  async componentDidMount() {
    await request_storage_runtime_permission()
    this.getImage()
  }
   getImage(){
  this.setState({urlpramas:this.props.navigation.getParam('url', null)})
    var url=this.state.urlpramas==null?this.state.url:this.state.urlpramas
  fetch(url)
    .then(response => response.json())
    .then(responseJson => {
     responseJson = responseJson.photos.photo.slice((this.offset*11),((this.offset+1)*11)-1)
               console.log("offset : "+this.offset);


      this.offset = this.offset + 1;
      //After the response increasing the offset for the next API call.
      this.setState({
       // serverData: [...this.state.serverData, ...responseJson.results],
       serverData: [...this.state.serverData, ...responseJson],
        //adding the new data with old one available in Data Source of the List
        loading: false,
        //updating the loading state to false
      });
    })
    .catch(error => {
      console.error(error);
    });
 }

  _onRefresh = ()=> {
  this.setState({isrefesh:true})
  this.getImage()
  setTimeout(()=>{
    this.setState({isrefesh:false})
  },1500)

  }

  loadMoreData = () => {
   
  
    var url=this.state.urlpramas==null?this.state.url:this.state.urlpramas
    this.setState({ fetching_from_server: true }, () => { 
   
      fetch(url)
          .then(response => response.json())
          .then(responseJson => {
           responseJson = responseJson.photos.photo.slice((this.offset*11),((this.offset+1)*11)-1)
            console.log("offset Load : "+this.offset);
        //  console.log(responseJson);
          //Successful response from the API Call 
            this.offset = this.offset + 1;
           
            this.setState({
  
              serverData: [...this.state.serverData, ...responseJson],
              fetching_from_server: false,
              //updating the loading state to false
            });
          })
          .catch(error => {
            console.error(error);
          });
    });
    setTimeout(()=>{
      this.setState({fetching_from_server:false})
    },4000)
  };


  renderFooter() {
    return (
   
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={this.loadMoreData}
         style={{marginBottom:19}}
        >
         
          {this.state.fetching_from_server ? (
            <ActivityIndicator size="large"   color="blue" style={{ marginLeft: 8 ,marginBottom:10}} />
          ) : null}
        </TouchableOpacity>
      </View>
    );
  }


  render() {
    const android = RNFetchBlob.android
    return (
      <View  style={styles.container}>
     
        {this.state.loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <FlatList
          refreshControl={ <RefreshControl
            refreshing={this.state.isrefesh}
            onRefresh={this._onRefresh}
         
          />}
          CellRendererComponent={({ children, item, ...props }) => {
            return (
                <View {...props} style={{ marginTop: item.marginTop }}>
                    {children}
                </View>
            )
        }}
          contentContainerStyle={{width: '100%',backgroundColor:'#fff',alignItems:'center', }}
            numColumns={2}
         
            keyExtractor={(item, index) =>String(item.id)}
            data={this.state.serverData}
            renderItem={({ item, index }) => (
              <View  style={{backgroundColor:'#fff',marginTop:10,marginLeft:3,margin:5 ,flexDirection:'row'}}>
              <TouchableOpacity style={[styles.shad,{height:item.height_q,width:item.width_q,position:'relative',flexDirection:'row',alignItems:'center'}]}
              onPress={()=>
      
              this.props.navigation.navigate('Details',{url:this.state.serverData,index:index})
             
              } >
              
                <Image style={{height:item.height_q,width:item.width_q,borderRadius:6,position:'absolute',  resizeMode: 'cover'}} source={{uri:String(item.url_l)}}></Image>
                <Text style={{left:20,position:'absolute',padding:1,fontSize:10,backgroundColor:'#ccc',borderRadius:3,opacity:0.6,top:'80%'}}>{item.views} view</Text>
            
                </TouchableOpacity>
          </View>
            )}
            onEndReached={this.loadMoreData}
            onEndReachedThreshold ={0.1}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListFooterComponent={this.renderFooter.bind(this)}
            //Adding Load More button as footer component
          />
        )}
        </View>
     
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  
backgroundColor:'#fff'
  },

  separator: {
    height: 0.5,
  
  },
  text: {
    fontSize: 15,
    color: 'black',
  },
  footer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  loadMoreBtn: {
    padding: 10,
    backgroundColor: '#800000',
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontSize: 15,
    textAlign: 'center',
  }, shad:{
   backgroundColor:'#fff', borderRadius:10,alignItems:'center',marginLeft:2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.36,
    shadowRadius: 6.68,
    
    elevation: 11,
  }, viewRow: {
    flexDirection: 'row'
 }
});
