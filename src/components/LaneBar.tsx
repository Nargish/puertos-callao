import { View } from 'react-native';
export function LaneBar({ occupancy, capacity }:{ occupancy:number; capacity:number }) {
const isFull = occupancy >= capacity;
return (
<View style={{ flexDirection:'row', gap:4 }}>
{Array.from({ length: capacity }).map((_,i)=>{
const filled = i < occupancy;
return (
<View key={i} style={{ width:10, height:18, borderRadius:2, backgroundColor: filled ? (isFull? 'red':'green') : '#ccc' }} />
);
})}
</View>
);
}