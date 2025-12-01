import { View, Text, Pressable, ScrollView } from 'react-native';
import { useTerminal, useLanes, useLanesRealtime, incLane, decLane, resetLane } from '@/features/lanes/hooks';


export default function Admin() {
const { data: term } = useTerminal('Manco Cápac'); // filtra por terminal deseado
const { data: lanes } = useLanes(term?.id);
useLanesRealtime(term?.id);


return (
<ScrollView contentContainerStyle={{ padding:16, gap:12 }}>
<Text style={{ fontSize:22, fontWeight:'700' }}>Admin – {term?.name}</Text>
{lanes?.map(l => {
const occ = l.state?.occupancy ?? 0;
return (
<View key={l.id} style={{ borderWidth:1, borderRadius:8, padding:12, gap:8 }}>
<Text style={{ fontWeight:'600' }}>{l.name} — {occ}/{l.capacity}</Text>
<View style={{ flexDirection:'row', gap:8 }}>
<Pressable onPress={()=>incLane(l.id)} style={{ padding:8, backgroundColor:'#def', borderRadius:6 }}><Text>+1</Text></Pressable>
<Pressable onPress={()=>decLane(l.id)} style={{ padding:8, backgroundColor:'#fed', borderRadius:6 }}><Text>-1</Text></Pressable>
<Pressable onPress={()=>resetLane(l.id)} style={{ padding:8, backgroundColor:'#eee', borderRadius:6 }}><Text>Reset</Text></Pressable>
</View>
</View>
);
})}
</ScrollView>
);
}