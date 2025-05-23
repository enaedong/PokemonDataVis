import TYPE_COLORS from "../utils/typeColors";

// components/ChartControls.jsx
export default function ChartControls({
  selected,
  items, setItems,
  selectedItem, setSelectedItem,
  koSelected, switchKo,
  endureSelected, switchEndure,
  powerInput,
  clicked, setClicked,  
  typeDropdownOpen, setTypeDropdownOpen,
  typeDropdownHover, setTypeDropdownHover,
  typeDropdownValue, setTypeDropdownValue,
  typeDropdownRef, x, y, gx, gy,
  height, marginBottom, marginLeft,
  TYPE_COLORS
}) {
  const typeOptions = [
    "All",
    "Advantage",
    "Disadvantage"
  ];

  function searchDex(ko, end, ty, pow, targetName){    
    // 모든 포켓몬 하나하나 데미지 계산후 저장
    // ko & end = knock-out vs endure
    // ty = 상성 유리 불리 중 사용자가 보고 싶은 것
    // pow = 사용자가 입력한 기술 위력
    // target = 메타 포켓몬 이름 (데이터는 여기서 찾음)
    function calcDm(isKo, tar, dex, pow, type){
        // 몇대 버티는지, 몇방에 잡는지 계산
        // isKo = 사용자가 knock-out을 선택했는가
        // tar = 메타(타켓) 포켓몬 정보
        // dex = 카운터 포켓몬 정보
        const hp = 60 + Math.floor((2 * tar.stat.hp + 31 + 63) / 2)
        const atk = Math.floor((Math.floor((2 * tar.stat.atk + 31 + 63) / 2) + 5) * 1.1)
        const def = Math.floor((Math.floor((2 * tar.stat.def + 31 + 63) / 2) + 5) * 1.1)
        const spa = Math.floor((Math.floor((2 * tar.stat.spa + 31 + 63) / 2) + 5) * 1.1)
        const spd = Math.floor((Math.floor((2 * tar.stat.spd + 31 + 63) / 2) + 5) * 1.1)

        const hpDex = 60 + Math.floor((2 * dex.stat.hp + 31 + 63) / 2)
        const atkDex = Math.floor((Math.floor((2 * dex.stat.atk + 31 + 63) / 2) + 5) * 1.1)
        const defDex = Math.floor((Math.floor((2 * dex.stat.def + 31 + 63) / 2) + 5) * 1.1)
        const spaDex = Math.floor((Math.floor((2 * dex.stat.spa + 31 + 63) / 2) + 5) * 1.1)
        const spdDex = Math.floor((Math.floor((2 * dex.stat.spd + 31 + 63) / 2) + 5) * 1.1)

        // 메타 포켓몬을 몇방에 잡을수 있는가
        if(type === 0){
        return 5;
        }
        if(isKo){
        const atkCount = hp / ((22 * pow * (atkDex / def) / 50 + 2) * 1.5 * type * 0.925)
        const spaCount = hp / ((22 * pow * (spaDex / spd) / 50 + 2) * 1.5 * type * 0.925)
        const dmgCount = Math.max(atkCount, spaCount) > 5 ? 5 : Math.max(atkCount, spaCount)
        return dmgCount;
        }
        else{
        // 메타 포켓몬 공격을 몇방 버티는가
        const atkCount = hpDex / ((22 * pow * (atk / defDex) / 50 + 2) * 1.5 * type * 0.925)
        const spaCount = hpDex / ((22 * pow * (spa / spdDex) / 50 + 2) * 1.5 * type * 0.925)
        const dmgCount = Math.max(atkCount, spaCount) > 5 ? 5 : Math.max(atkCount, spaCount)
        return dmgCount;
        }
    }
    fetch('/dex.json')
    .then((res) => res.json())
    .then((data) => {
        return fetch('/atkType.json')
        .then(res => res.json())
        .then(typeData => {
            const target = data.find(obj => obj.name == targetName);
            const pokeResult = [];
            if(ko){
            data.forEach(poke => {
                let typeMatch;
                // 타입 상성 계산
                // 타겟 포켓몬 복합타입인가
                if(target.type.length > 1){   
                // 카운터 포켓몬이 복합타입인가           
                if(poke.type.length > 1){
                    // 최종 타입 상성 (0~4)
                    typeMatch = Math.max(typeData[poke.type[0]][target.type[0]] * typeData[poke.type[0]][target.type[1]], typeData[poke.type[1]][target.type[0]] * typeData[poke.type[1]][target.type[1]])
                }
                else{
                    typeMatch = typeData[poke.type[0]][target.type[0]] * typeData[poke.type[0]][target.type[1]]
                }
                }
                else{
                if(poke.type.length > 1){
                    // 최종 타입 상성 (0~4)
                    typeMatch = Math.max(typeData[poke.type[0]][target.type[0]], typeData[poke.type[1]][target.type[0]])
                }
                else{
                    typeMatch = typeData[poke.type[0]][target.type[0]]
                }
                }
                const pokeObj = {};
                // 이름 & 1타입 & 타입 유불리 & 횟수 계산 결과 & 스피드를 object로 묶어서 저장
                const typeAdv = typeMatch >= 1 ? true : false
                if((ty == "Advantage" && typeAdv) || (ty == "Disadvantage" && !typeAdv) || ty == "All"){
                pokeObj.name = poke.name;
                pokeObj.type = poke.type[0].toLowerCase();
                pokeObj.typeAdv = typeAdv;
                pokeObj.count = calcDm(true, target, poke, pow, typeMatch);
                pokeObj.speed = poke.stat.spe;
                pokeResult.push(pokeObj);
                }
            })
            }
            else if(end){
            // 몇 방 버티는지 계산
            data.forEach(poke => {
                let typeMatch;
                // 타입 상성 계산
                // 타겟 포켓몬 복합타입인가
                if(poke.type.length > 1){   
                // 카운터 포켓몬이 복합타입인가           
                if(target.type.length > 1){
                    // 최종 타입 상성 (0~4)
                    typeMatch = Math.max(typeData[target.type[0]][poke.type[0]] * typeData[target.type[0]][poke.type[1]], typeData[target.type[1]][poke.type[0]] * typeData[target.type[1]][poke.type[1]])
                }
                else{
                    typeMatch = typeData[target.type[0]][poke.type[0]] * typeData[target.type[0]][poke.type[1]]
                }
                }
                else{
                if(target.type.length > 1){
                    // 최종 타입 상성 (0~4)
                    typeMatch = Math.max(typeData[target.type[0]][poke.type[0]], typeData[target.type[1]][poke.type[0]])
                }
                else{
                    typeMatch = typeData[target.type[0]][poke.type[0]]
                }
                }
                const pokeObj = {};
                // 이름 & 1타입 & 타입 유불리 & 횟수 계산 결과 & 스피드를 object로 묶어서 저장
                const typeAdv = typeMatch > 1 ? false : true
                if((ty == "Advantage" && typeAdv) || (ty == "Disadvantage" && !typeAdv) || ty == "All"){
                pokeObj.name = poke.name;
                pokeObj.type = poke.type[0].toLowerCase();
                pokeObj.typeAdv = typeAdv;            
                pokeObj.count = calcDm(false, target, poke, pow, typeMatch);
                pokeObj.speed = poke.stat.spe;
                pokeResult.push(pokeObj);
                }
            })
            }
            setItems(pokeResult);
        })
    })
    .catch(err => console.error('Error fetching JSON:', err));
    }

  return (
    <g>
    <div className="search-buttons-row">          
          Search for Pokemon that
        </div>
        <div className="chart-buttons-row">
          <button className={koSelected ? "chart-btn-red" : "chart-btn"} onClick={() => switchKo()}>Knock-Out</button>
          <button className={endureSelected ? "chart-btn-green" : "chart-btn"} onClick={() => switchEndure()}>Endure</button>
          {selected != null ? <div className="target-name">{selected.name.toUpperCase()}</div> : <div className="target-name">target Pokemon</div>}
        </div>  
        {(koSelected || endureSelected) &&
          <div className="chart-buttons-row">            
            <div className="target-name">with Type</div>
            <div
              className="dropdown-btn-wrapper"
              ref={typeDropdownRef}
              tabIndex={0}            
            >
              <button
                className="chart-btn dropdown-btn"
                onClick={() => setTypeDropdownOpen((open) => !open)}
                aria-haspopup="listbox"
                aria-expanded={typeDropdownOpen}
              >
                {typeDropdownValue}
                <span className="dropdown-arrow">&#9662;</span>
              </button>
              {typeDropdownOpen && (
                <ul className="dropdown-menu" role="listbox">
                  {typeOptions.map((option) => (
                    <li
                      key={option}
                      className={
                        "dropdown-menu-item" +
                        ((typeDropdownHover || typeDropdownValue) === option
                          ? " selected"
                          : "")
                      }
                      role="option"
                      aria-selected={
                        (typeDropdownHover || typeDropdownValue) === option
                      }
                      onMouseEnter={() => setTypeDropdownHover(option)}
                      onMouseLeave={() => setTypeDropdownHover(null)}
                      onClick={() => {
                        setTypeDropdownValue(option);
                        setTypeDropdownOpen(false);
                        setTypeDropdownHover(null);   
                      }}                                                          
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div style={{visibility: 'hidden'}} className="target-name">with Type</div>
          </div>
        }      
        {(koSelected || endureSelected) && 
          <div className="search-buttons-row">
            <div className="target-name">Attack power</div>     
            <input className="move-btn" type="number" placeholder="Enter Move Power" style={{ textAlign: 'center' }}
              ref={powerInput}
            />   
            <button className="chart-btn" 
              onClick={() => {   
                setClicked(true)             
                searchDex(koSelected, endureSelected, typeDropdownValue, powerInput.current.value, selected.name)}}>search</button>         
          </div>
        }              
        <div className="chart-area">
          {/* Chart will be rendered here */}
          {clicked ?
            (<svg width={500} height={300}>
              <g ref={gx}
                transform={`translate(0, ${height - marginBottom})`} />
              <g ref={gy}
                transform={`translate(${marginLeft}, 0)`} />
              <g>
                {items.map((item) => {						
                  return (
                    <g key={item.name}
                      className= 'datapoint'
                      style={{ fill: TYPE_COLORS[item.type] }}
                      transform={`translate(${
                          x(item.count)}, ${
                          y(item.speed)})`}>
                      <circle cx="0" cy="0" r="3"
                        onClick={() => setSelectedItem(item.name)}
                      />		
                      <g className= {selectedItem == item.name ? 'display' : 'hide'}>
                        <rect x="-30" y="-20" width="60" height="20" fill="black" rx="5" ry="5"></rect>
                        <text x="0" y="-10" textAnchor="middle" fontSize="10" fill="white"> {item.name} </text>
                      </g>	
                    </g>
                  );
                })}
              </g>
            </svg>) : (<span className="chart-placeholder">Click the button above to see the result</span>)
          }
    </div></g>
  );
}
